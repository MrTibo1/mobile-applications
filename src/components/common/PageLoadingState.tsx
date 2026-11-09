import { LoadingState } from './LoadingState';
import { PageContainer } from './PageContainer';

export function PageLoadingState() {
  return (
    <PageContainer safeArea={false}>
      <LoadingState inline />
    </PageContainer>
  );
}
