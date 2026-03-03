import React from 'react';
import { Shield, Star, Diamond, Crown, Sparkles } from 'lucide-react';

interface LevelIconProps {
  level: string;
  color: string;
  size?: number;
  className?: string;
}

export const LevelIcon: React.FC<LevelIconProps> = ({ level, color, size = 24, className }) => {
  const iconProps = { size, color, className };
  switch (level) {
    case 'Iniciado': return <Sparkles {...iconProps} />;
    case 'Bronze': return <Shield {...iconProps} />;
    case 'Prata': return <Shield {...iconProps} />;
    case 'Ouro': return <Star {...iconProps} />;
    case 'Diamante': return <Diamond {...iconProps} />;
    case 'Esmeralda': return <Diamond {...iconProps} />;
    case 'Superconsciência': return <Crown {...iconProps} />;
    default: return <Sparkles {...iconProps} />;
  }
};
