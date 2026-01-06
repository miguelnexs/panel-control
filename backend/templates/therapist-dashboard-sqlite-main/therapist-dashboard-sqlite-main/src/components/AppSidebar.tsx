
import { LayoutDashboard, Users, Calendar, Activity, UserPlus, Settings, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Terapeutas",
    url: "/terapeutas",
    icon: Users,
    badge: "4",
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: UserPlus,
    badge: "7",
  },
  {
    title: "Sesiones",
    url: "/sesiones",
    icon: Calendar,
    badge: "12",
  },
  {
    title: "Estadísticas",
    url: "/estadisticas",
    icon: Activity,
    badge: null,
  },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">TerapeuApp</h2>
              <p className="text-xs text-muted-foreground">Gestión Profesional</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full justify-start gap-3 h-10 ${
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{item.title}</span>
                          {item.badge && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            Herramientas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start gap-3 h-10">
                  <FileText className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium">Reportes</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start gap-3 h-10">
                  <Settings className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium">Configuración</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@terapeuapp.com</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              AD
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
