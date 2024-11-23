import { Link, useMatches } from "@tanstack/react-router"
import { Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator } from '@dumpanddone/ui'

export const DumpanddoneBreadcrumb = () => {
    const matches = useMatches()
    const routes = matches.filter((m) => ({name: m.context.title, url: m.pathname}))
    return (
        <Breadcrumb>
        <BreadcrumbList>
        {routes.map((r) => (
            <>
            <BreadcrumbItem className="hidden md:block">
            <Link to={r.pathname}>
            {r.context.title}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          </>
        ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
}