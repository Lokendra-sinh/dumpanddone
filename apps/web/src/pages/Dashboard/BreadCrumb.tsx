import { Link, useMatches } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@dumpanddone/ui";

export const DumpanddoneBreadcrumb = () => {
  const matches = useMatches();
  console.log("maches are", matches);
  const routes = matches.filter(
    (m) => m.id !== "/auth-route" && { name: m.context.title, url: m.pathname },
  );
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {routes.map((r) => (
          <div className="flex items-center gap-2" key={r.id}>
            <BreadcrumbItem className="hidden md:block">
              <Link to={r.pathname}>{r.context.title}</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
