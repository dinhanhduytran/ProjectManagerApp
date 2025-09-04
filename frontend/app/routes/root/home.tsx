import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Planora" },
    { name: "description", content: "Welcome to Planora!" },
  ];
}

export default function home() {
  return (
    <div>
      <Button>ClickMe</Button>
    </div>
  );
}
