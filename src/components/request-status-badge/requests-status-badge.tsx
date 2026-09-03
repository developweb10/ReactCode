import { Badge } from "@components/badge/badge";
import { RequestStatus } from "@models/requests.models";

interface Props {
  status: RequestStatus;
}
export const RequestStatusBadge: React.FC<Props> = ({ status }) => {
  switch (status) {
    case RequestStatus.APPROVED:
      return <Badge variant="success" title="Approved" />;
    case RequestStatus.REJECTED:
      return <Badge variant="error" title="Rejected" />;
    case RequestStatus.PENDING:
      return <Badge variant="info" title="Pending" />;

    default:
      return null;
  }
};
