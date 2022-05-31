import { Badge } from "~/components/badge";

export default function RouteComponent() {
  return (
    <div className="mt-8 flex flex-col items-center gap-5">
      <div className="flex gap-2">
        <Badge>Badge</Badge>
        <Badge color="red">Badge</Badge>
        <Badge color="yellow">Badge</Badge>
        <Badge color="green">Badge</Badge>
      </div>
      <div className="flex gap-2">
        <Badge large>Badge</Badge>
        <Badge color="red" large>
          Badge
        </Badge>
        <Badge color="yellow" large>
          Badge
        </Badge>
        <Badge color="green" large>
          Badge
        </Badge>
      </div>
    </div>
  );
}
