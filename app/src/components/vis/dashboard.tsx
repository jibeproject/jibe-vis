import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MelbourneModeShift } from './MelbourneModeShift';
import Error404 from '../404-page';

const Dashboard: FC = () => {
  const [searchParams] = useSearchParams();
  const pathway = searchParams.get('pathway');

  switch (pathway) {
    case 'melbourne-mode-shift':
      return <MelbourneModeShift />;
    default:
      return <Error404 />;
  }
};

export default Dashboard;
