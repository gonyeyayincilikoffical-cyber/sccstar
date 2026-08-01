import React, { useRef, useEffect, useState } from 'react';
import { MatchScenario, PlayerProfile, AICommentaryReport } from '../types';
import {
  X,
  Play,
  RefreshCw,
  Trophy,
  Zap,
  ShieldAlert,
  Award,
  ChevronRight,
  Newspaper,
  MessageSquareQuote,
  Box,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchCanvasModalProps {
  scenario: MatchScenario | null;
  player: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onGoalScored: (scenario: MatchScenario, goalsAdded: number, assistsAdded: number, matchRating: number) => void;
}

interface Point {
  x: number;
  y: number;
}

export const MatchCanvasModal: React.FC<MatchCanvasModalProps> = ({
  scenario,
  player,
  isOpen,
  onClose,
  onGoalScored,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [trajectory, setTrajectory] = useState<Point[]>([]);
  const [ballPos, setBallPos] = useState<Point | null>(null);
  const [ballZ, setBallZ] = useState<number>(0); // 3D altitude of ball above turf
  const [goalkeeperPos, setGoalkeeperPos] = useState<Point | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchResult, setMatchResult] = useState<'goal' | 'saved' | 'missed' | 'assist' | null>(null);
  const [aiReport, setAiReport] = useState<AICommentaryReport | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // 3D Stadium perspective camera toggle
  const [cameraMode, setCameraMode] = useState<'3d_stadium' | 'top_down'>('3d_stadium');

  // Multi-stage scenario state (e.g. Pass first, then Shoot!)
  const [stage, setStage] = useState<1 | 2>(1);
  const [stageMessage, setStageMessage] = useState<string | null>(null);

  // Initialize positions when scenario opens
  useEffect(() => {
    if (!isOpen || !scenario) return;
    setTrajectory([]);
    setBallPos({ x: scenario.ballStart.x, y: scenario.ballStart.y });
    setBallZ(0);
    setGoalkeeperPos({ x: scenario.goalkeeper.x, y: scenario.goalkeeper.y });
    setMatchResult(null);
    setAiReport(null);
    setIsAnimating(false);
    setStage(1);
    setStageMessage(null);
  }, [isOpen, scenario]);

  // Helper function to draw 3D soccer players on the turf
  const draw3DPlayer = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    jerseyColor: string,
    label: string,
    isUser = false
  ) => {
    ctx.save();

    // 1. Ground Drop Shadow (ellipse on grass)
    ctx.beginPath();
    ctx.ellipse(px, py + 12, 16, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Glowing turf ring for User or Target Teammate
    if (isUser) {
      ctx.beginPath();
      ctx.ellipse(px, py + 12, 20, 8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 3. Shorts (legs base)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px - 7, py + 1, 14, 10);

    // 4. Jersey Torso (3D gradient body)
    const torsoGrad = ctx.createLinearGradient(px - 10, py - 14, px + 10, py + 4);
    torsoGrad.addColorStop(0, jerseyColor);
    torsoGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.roundRect(px - 11, py - 14, 22, 16, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Head & Shoulders
    ctx.beginPath();
    ctx.arc(px, py - 20, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fbd38d'; // Skin tone
    ctx.fill();

    // Hair
    ctx.beginPath();
    ctx.arc(px, py - 22, 7, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // 6. Floating Name & Jersey Number Banner
    ctx.fillStyle = isUser ? '#10B981' : 'rgba(15, 23, 42, 0.85)';
    ctx.font = 'bold 10px sans-serif';
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(px - textWidth / 2 - 5, py - 36, textWidth + 10, 14);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(label, px, py - 26);

    ctx.restore();
  };

  // Render game scene on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scenario) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (cameraMode === '3d_stadium') {
      // ===== 3D PERSPECTIVE STADIUM VIEW =====
      // 1. Stadium Floodlight & Sky Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.18);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.18);

      // Floodlights glow
      const glow = ctx.createRadialGradient(width * 0.5, 0, 10, width * 0.5, 0, 220);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height * 0.25);

      // 2. 3D Perspective Grass Field
      const grassGrad = ctx.createLinearGradient(0, height * 0.18, 0, height);
      grassGrad.addColorStop(0, '#14532d');
      grassGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, height * 0.18, width, height * 0.82);

      // 3D Perspective Grass Stripes
      for (let i = height * 0.18; i < height; i += 34) {
        ctx.fillStyle = ((i - height * 0.18) / 34) % 2 === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
        ctx.fillRect(0, i, width, 34);
      }

      // 3. Perspective Field Lines (converging towards horizon)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.5;

      // Penalty area 3D box
      ctx.beginPath();
      ctx.moveTo(width * 0.18, height * 0.18);
      ctx.lineTo(width * 0.82, height * 0.18);
      ctx.lineTo(width * 0.88, height * 0.44);
      ctx.lineTo(width * 0.12, height * 0.44);
      ctx.closePath();
      ctx.stroke();

      // Goal Area (6-yard box)
      ctx.beginPath();
      ctx.moveTo(width * 0.33, height * 0.18);
      ctx.lineTo(width * 0.67, height * 0.18);
      ctx.lineTo(width * 0.7, height * 0.27);
      ctx.lineTo(width * 0.3, height * 0.27);
      ctx.closePath();
      ctx.stroke();

      // 4. 3D Goal Posts & Net with depth
      const goalLeftX = width * 0.32;
      const goalRightX = width * 0.68;
      const goalBottomY = height * 0.18;
      const goalTopY = height * 0.07;

      // Net back mesh in 3D
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(goalLeftX, goalBottomY);
      ctx.lineTo(goalLeftX + 15, goalTopY);
      ctx.lineTo(goalRightX - 15, goalTopY);
      ctx.lineTo(goalRightX, goalBottomY);
      ctx.closePath();
      ctx.fill();

      // Net grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      for (let x = goalLeftX; x <= goalRightX; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, goalBottomY);
        ctx.lineTo(x + (x < width * 0.5 ? 8 : -8), goalTopY);
        ctx.stroke();
      }

      // Goal Target Highlight banner
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fillRect(
        goalLeftX,
        goalTopY,
        goalRightX - goalLeftX,
        goalBottomY - goalTopY
      );

      // White 3D goal posts
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(goalLeftX - 3, goalTopY, 6, goalBottomY - goalTopY); // Left post
      ctx.fillRect(goalRightX - 3, goalTopY, 6, goalBottomY - goalTopY); // Right post
      ctx.fillRect(goalLeftX - 3, goalTopY - 4, goalRightX - goalLeftX + 6, 6); // Crossbar

      // 5. Draw 3D Teammate Target (if through pass / pass & shoot / corner)
      if (scenario.teammateTarget) {
        const tmX = width * (scenario.teammateTarget.x / 100);
        const tmY = height * (scenario.teammateTarget.y / 100);

        // Glowing target zone on grass
        ctx.beginPath();
        ctx.ellipse(tmX, tmY + 12, 26, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2;
        ctx.stroke();

        draw3DPlayer(ctx, tmX, tmY, '#0284c7', scenario.teammateTarget.name || 'GOLCÜ ARKADAŞ', false);
      }

      // 6. Draw 3D Defenders (Wall / Opponents)
      scenario.defenders.forEach((def, idx) => {
        const defX = width * (def.x / 100);
        const defY = height * (def.y / 100);
        draw3DPlayer(ctx, defX, defY, '#dc2626', `DEF #${idx + 4}`, false);
      });

      // 7. Draw 3D Goalkeeper
      const gk = goalkeeperPos || { x: scenario.goalkeeper.x, y: scenario.goalkeeper.y };
      const gkX = width * (gk.x / 100);
      const gkY = height * (gk.y / 100);
      draw3DPlayer(ctx, gkX, gkY, '#f59e0b', 'KALECİ', false);

      // 8. Draw Player (SEN - Kerem Atak / User)
      const startX = width * ((stage === 2 && scenario.secondStage ? scenario.secondStage.ballStart.x : scenario.ballStart.x) / 100);
      const startY = height * ((stage === 2 && scenario.secondStage ? scenario.secondStage.ballStart.y : scenario.ballStart.y) / 100);
      draw3DPlayer(ctx, startX - 18, startY + 6, '#10B981', 'SEN (10)', true);

      // 9. Draw Aiming Trajectory Curve in 3D
      if (trajectory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(width * (trajectory[0].x / 100), height * (trajectory[0].y / 100));
        for (let i = 1; i < trajectory.length; i++) {
          ctx.lineTo(width * (trajectory[i].x / 100), height * (trajectory[i].y / 100));
        }
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 10. Draw 3D Soccer Ball with Altitude Physics (Z-height shadow)
      const bPos = ballPos || {
        x: stage === 2 && scenario.secondStage ? scenario.secondStage.ballStart.x : scenario.ballStart.x,
        y: stage === 2 && scenario.secondStage ? scenario.secondStage.ballStart.y : scenario.ballStart.y,
      };
      const bx = width * (bPos.x / 100);
      const by = height * (bPos.y / 100);

      // Shadow on Grass (stays at grass elevation by)
      ctx.beginPath();
      ctx.ellipse(bx, by + 6, 11 - Math.min(6, ballZ * 0.15), 5 - Math.min(3, ballZ * 0.1), 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      // Altitude Line (from shadow to elevated ball)
      if (ballZ > 2) {
        ctx.beginPath();
        ctx.moveTo(bx, by + 6);
        ctx.lineTo(bx, by - ballZ);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3D Elevated Soccer Ball
      const ballRadius = 13;
      const elevatedY = by - ballZ;

      // Shaded ball gradient
      const ballGrad = ctx.createRadialGradient(
        bx - 3,
        elevatedY - 3,
        2,
        bx,
        elevatedY,
        ballRadius
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(bx, elevatedY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      // Soccer ball pentagon detail
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(bx, elevatedY, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // ===== 2D TOP-DOWN TACTICAL CAMERA =====
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, width, height);

      // Field lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.strokeRect(width * 0.2, 0, width * 0.6, height * 0.28);
      ctx.strokeRect(width * 0.35, 0, width * 0.3, height * 0.1);

      // Goal target
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.fillRect(
        width * (scenario.goalTarget.xMin / 100),
        0,
        width * ((scenario.goalTarget.xMax - scenario.goalTarget.xMin) / 100),
        16
      );

      // Teammate target
      if (scenario.teammateTarget) {
        const tmX = width * (scenario.teammateTarget.x / 100);
        const tmY = height * (scenario.teammateTarget.y / 100);
        ctx.beginPath();
        ctx.arc(tmX, tmY, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAS', tmX, tmY + 4);
      }

      // Defenders
      scenario.defenders.forEach((def) => {
        const defX = width * (def.x / 100);
        const defY = height * (def.y / 100);
        ctx.beginPath();
        ctx.arc(defX, defY, (width * def.radius) / 100, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RAKİP', defX, defY + 4);
      });

      // Goalkeeper
      const gk = goalkeeperPos || { x: scenario.goalkeeper.x, y: scenario.goalkeeper.y };
      const gkX = width * (gk.x / 100);
      const gkY = height * (gk.y / 100);
      ctx.beginPath();
      ctx.arc(gkX, gkY, width * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KALECİ', gkX, gkY + 4);

      // Trajectory
      if (trajectory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(width * (trajectory[0].x / 100), height * (trajectory[0].y / 100));
        for (let i = 1; i < trajectory.length; i++) {
          ctx.lineTo(width * (trajectory[i].x / 100), height * (trajectory[i].y / 100));
        }
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Ball
      const bPos = ballPos || {
        x: stage === 2 && scenario.secondStage ? scenario.secondStage.ballStart.x : scenario.ballStart.x,
        y: stage === 2 && scenario.secondStage ? scenario.secondStage.ballStart.y : scenario.ballStart.y,
      };
      const bx = width * (bPos.x / 100);
      const by = height * (bPos.y / 100);
      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
    }
  }, [scenario, trajectory, ballPos, ballZ, goalkeeperPos, cameraMode, stage]);

  if (!isOpen || !scenario) return null;

  // Convert client coordinates to canvas percentage coordinates
  const getCanvasPercent = (clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating || matchResult) return;
    const pt = getCanvasPercent(e.clientX, e.clientY);
    if (!pt) return;

    const currentBallStart =
      stage === 2 && scenario.secondStage ? scenario.secondStage.ballStart : scenario.ballStart;

    const distToBall = Math.hypot(pt.x - currentBallStart.x, pt.y - currentBallStart.y);
    if (distToBall < 25) {
      setIsDrawing(true);
      setTrajectory([pt]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || isAnimating || matchResult) return;
    const pt = getCanvasPercent(e.clientX, e.clientY);
    if (!pt) return;
    setTrajectory((prev) => [...prev, pt]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (trajectory.length < 4) {
      setTrajectory([]);
      return;
    }

    simulateShot(trajectory);
  };

  const simulateShot = async (path: Point[]) => {
    setIsAnimating(true);
    const target = path[path.length - 1];

    // Animate ball along path with 3D Z-altitude physics
    for (let i = 0; i < path.length; i++) {
      setBallPos(path[i]);

      // Calculate parabolic Z altitude (rises in the middle of flight)
      const progress = i / (path.length - 1);
      const arcHeight = Math.sin(progress * Math.PI) * 28; // Up to 28px altitude
      setBallZ(arcHeight);

      // Move goalkeeper slightly towards ball X
      setGoalkeeperPos((prev) => {
        if (!prev) return null;
        const targetX = prev.x + (path[i].x - prev.x) * scenario.goalkeeper.agility * 0.38;
        return { x: Math.max(28, Math.min(72, targetX)), y: prev.y };
      });

      await new Promise((r) => setTimeout(r, 16));
    }

    setBallZ(0);

    // Check collision with defenders
    let hitDefender = false;
    for (const pt of path) {
      for (const def of scenario.defenders) {
        if (Math.hypot(pt.x - def.x, pt.y - def.y) < def.radius + 3) {
          hitDefender = true;
          break;
        }
      }
      if (hitDefender) break;
    }

    // MULTI-STAGE: If scenario is pass_and_shoot & currently in stage 1
    if (scenario.scenarioType === 'pass_and_shoot' && stage === 1 && scenario.teammateTarget && scenario.secondStage) {
      const distToTeammate = Math.hypot(
        target.x - scenario.teammateTarget.x,
        target.y - scenario.teammateTarget.y
      );

      if (!hitDefender && distToTeammate < 18) {
        setStage(2);
        setStageMessage(scenario.secondStage.prompt);
        setBallPos(scenario.secondStage.ballStart);
        setTrajectory([]);
        setIsAnimating(false);
        confetti({ particleCount: 50, spread: 50 });
        return;
      }
    }

    // MULTI-STAGE: If scenario is through_pass
    if (scenario.scenarioType === 'through_pass' && scenario.teammateTarget) {
      const distToTeammate = Math.hypot(
        target.x - scenario.teammateTarget.x,
        target.y - scenario.teammateTarget.y
      );

      if (!hitDefender && distToTeammate < 20) {
        setMatchResult('assist');
        setIsAnimating(false);
        confetti({ particleCount: 120, spread: 70 });
        await generateAiReport('goal');
        onGoalScored(scenario, 0, 1, 9.4);
        return;
      }
    }

    // MULTI-STAGE: If scenario is corner_header
    if (scenario.scenarioType === 'corner_header' && scenario.teammateTarget) {
      const distToStriker = Math.hypot(
        target.x - scenario.teammateTarget.x,
        target.y - scenario.teammateTarget.y
      );

      if (!hitDefender && distToStriker < 22) {
        setMatchResult('goal');
        setIsAnimating(false);
        confetti({ particleCount: 140, spread: 80 });
        await generateAiReport('goal');
        onGoalScored(scenario, 1, 1, 9.5);
        return;
      }
    }

    // STANDARD GOAL EVALUATION
    const isInsideGoalX = target.x >= scenario.goalTarget.xMin && target.x <= scenario.goalTarget.xMax;
    const isInsideGoalY = target.y <= scenario.goalTarget.y + 14;

    let result: 'goal' | 'saved' | 'missed' = 'missed';

    if (hitDefender) {
      result = 'saved';
    } else if (isInsideGoalX && isInsideGoalY) {
      const gkDistance = Math.hypot(target.x - (goalkeeperPos?.x || 50), target.y - (goalkeeperPos?.y || 15));
      if (gkDistance < 8) {
        result = 'saved';
      } else {
        result = 'goal';
      }
    } else {
      result = 'missed';
    }

    setMatchResult(result);
    setIsAnimating(false);

    if (result === 'goal') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      await generateAiReport('goal');
      onGoalScored(scenario, 1, 0, 9.2);
    } else {
      await generateAiReport(result);
    }
  };

  const generateAiReport = async (res: 'goal' | 'saved' | 'missed' | 'assist') => {
    setLoadingAi(true);
    const isSuccess = res === 'goal' || res === 'assist';

    const fallbackReport: AICommentaryReport = {
      headline: isSuccess
        ? `${player.name.toUpperCase()} SAHADA DEVLEŞTİ! ${scenario?.opponent} AĞLARINI SARSIP ZAFERİ GETİRDİ!`
        : `${scenario?.opponent} KARŞISINDA NEFES KESEN MÜCADELE: ${player.name.toUpperCase()} DİREKTEN DÖNDÜ!`,
      coachComment: isSuccess
        ? `"${player.name} bugün sahada tam bir liderdi. 3D izometrik stadyum kamerasındaki pas ve vuruş becerisi şahaneydi."`
        : `"${player.name} çok gayretliydi, şans bu kez yanımızda değildi ancak pes etmeyeceğiz."`,
      pressBody: `${player.nationality} yıldız ${player.name}, ${
        scenario?.type === 'national' ? 'Milli Takım' : player.currentClub
      } formasıyla sergilediği performansla taraftarlardan büyük alkış aldı.`,
      fanSentiment: isSuccess ? 'COŞKULU' : 'MEMNUN',
    };

    try {
      const response = await fetch('/api/ai/match-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: player.name,
          nationality: player.nationality,
          currentClub: player.currentClub,
          matchType: scenario?.type || 'league',
          opponentName: scenario?.opponent || 'Rakip Takım',
          goalsScored: res === 'goal' ? 1 : 0,
          assists: res === 'assist' ? 1 : 0,
          rating: isSuccess ? 9 : 6,
          result: isSuccess ? 'win' : 'draw',
          scoreLine: isSuccess ? '2-1' : '1-1',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiReport(data);
      } else {
        setAiReport(fallbackReport);
      }
    } catch (err) {
      console.warn('Using fallback AI match report:', err);
      setAiReport(fallbackReport);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleRetry = () => {
    setTrajectory([]);
    setBallPos({ x: scenario.ballStart.x, y: scenario.ballStart.y });
    setBallZ(0);
    setGoalkeeperPos({ x: scenario.goalkeeper.x, y: scenario.goalkeeper.y });
    setMatchResult(null);
    setAiReport(null);
    setStage(1);
    setStageMessage(null);
  };

  const getScenarioHeaderLabel = () => {
    switch (scenario.scenarioType) {
      case 'pass_and_shoot':
        return stage === 1 ? '🎯 1. AŞAMA: ARKADAŞINA PAS AT!' : '🔥 2. AŞAMA: GELİŞİNE 90 ŞUTU ÇEK!';
      case 'corner_header':
        return '🎯 KÖŞE VURUŞU: CEZA SAHASINDAKİ GOLCÜYE ORTA KES!';
      case 'through_pass':
        return '🎯 ASİST GÖREVİ: İKİ DEFANS ARASINDAN ARA PASI VER!';
      case 'one_on_one':
        return '🎯 BİRE BİR: KALECİNİN AÇILMASINI FIRSAT BİL!';
      case 'penalty':
        return '🎯 PENALTI VURUŞU: KALECİYİ TERS KÖŞEYE YATIR!';
      default:
        return '🎯 3D STADYUM: TOPTAN KALEYE DOĞRU KAVİSLİ MERMİ ROTASI ÇİZ!';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  {scenario.type === 'national' ? '🇹🇷 MİLLİ TAKIM MAÇI' : '🏆 KARİYER SAHASI'}
                </span>
                <span className="text-xs text-slate-400 font-bold">{scenario.minute}'. Dakika</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {scenario.title} - vs {scenario.opponent}
              </h2>
            </div>
          </div>

          {/* Camera Switcher & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraMode(cameraMode === '3d_stadium' ? 'top_down' : '3d_stadium')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition text-xs font-bold flex items-center gap-1.5 border border-slate-700"
            >
              <Box className="w-4 h-4 text-emerald-400" />
              <span>{cameraMode === '3d_stadium' ? '3D Stadyum' : '2D Taktik'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{getScenarioHeaderLabel()}</span>
          </span>
          {isDrawing && (
            <span className="text-amber-400 animate-pulse font-bold">
              Çiziliyor... Parmağını kaldırınca şut çekilir
            </span>
          )}
        </div>

        {/* Stage Notification Banner (for multi-stage pass & shoot) */}
        {stageMessage && (
          <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-emerald-900/90 text-white px-4 py-2 font-black text-xs text-center border-b border-emerald-500/40 animate-pulse">
            🔥 {stageMessage}
          </div>
        )}

        {/* Canvas & Result Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center bg-black overflow-hidden p-2">
          <canvas
            ref={canvasRef}
            width={440}
            height={560}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="max-h-[60vh] w-auto rounded-2xl border-2 border-slate-700 shadow-2xl touch-none cursor-crosshair bg-slate-950"
          />

          {/* Overlay Result Modal */}
          {matchResult && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
                {matchResult === 'goal' || matchResult === 'assist' ? (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
                      {matchResult === 'assist' ? 'ŞAHANE ASİST! GOL GELDİ!' : 'GOL! EFSANEVİ 3D VURUŞ!'}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                      {scenario.opponent} ağlarını sarsarak takıma zaferi getirdin! +250 Altın & +10 Reyting kazandın.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 mb-3">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-red-400 tracking-tight">
                      {matchResult === 'saved' ? 'KALECİ KURTARDI / BARAJDAN DÖNDÜ!' : 'ŞUT DIŞARI ÇIKTI!'}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                      3D stadyum kamerasında falsolu rotayı daha keskin çizerek köşeyi avlamayı dene.
                    </p>
                  </>
                )}

                {/* AI Newspaper & Coach Comment Section */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
                    <Newspaper className="w-4 h-4" />
                    <span>SPOR GAZETESİ MANŞETİ (AI SPOR YORUMCUSU)</span>
                  </div>
                  {loadingAi ? (
                    <p className="text-xs text-slate-400 italic animate-pulse">
                      Basın manşeti ve teknik direktör raporu hazırlanıyor...
                    </p>
                  ) : aiReport ? (
                    <div className="space-y-2">
                      <p className="text-sm font-black text-amber-300 leading-snug">
                        "{aiReport.headline}"
                      </p>
                      <p className="text-xs text-slate-300">{aiReport.pressBody}</p>
                      <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
                        <MessageSquareQuote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-200">Teknik Direktör:</span> {aiReport.coachComment}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Tekrar Dene</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <span>Kariyer Menüsüne Dön</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
