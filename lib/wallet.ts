import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  base,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'LVLX Artist Passport',
  projectId: 'demo-project-id',
  chains: [mainnet, polygon, base],
  ssr: true,
});