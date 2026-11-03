export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  // INICIO
  {
    id: 'inicio',
    title: 'INICIO',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'admin',
    title: 'ADMINISTRACION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'users',
        title: 'Usuarios',
        type: 'collapse',
        icon: 'team',
        children: [
          { id: 'users-list', title: 'Listado', type: 'item', url: '/users', classes: 'nav-item' },
          { id: 'users-add', title: 'Crear usuario', type: 'item', url: '/users/add-user', classes: 'nav-item' }
        ]
      },
      {
        id: 'roles',
        title: 'Roles de seguridad',
        type: 'collapse',
        icon: 'safety',
        children: [
          { id: 'roles-list', title: 'Ver roles', type: 'item', url: '/roles/rol', classes: 'nav-item' },
          { id: 'roles-add', title: 'Crear rol', type: 'item', url: '/roles/add-rol', classes: 'nav-item' }
        ]
      },
      {
        id: 'password',
        title: 'Contraseña',
        type: 'item',
        url: '/password/change-pass',
        classes: 'nav-item',
        icon: 'lock'
      }
    ]
  },
  {
    id: 'modulos',
    title: 'MODULOS',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'projects',
        title: 'Proyectos',
        type: 'collapse',
        icon: 'project',
        children: [
          { id: 'projects-list', title: 'Ver proyectos', type: 'item', url: '/projects/project', classes: 'nav-item' },
          { id: 'projects-add', title: 'Crear proyecto', type: 'item', url: '/projects/add-project', classes: 'nav-item' }
        ]
      },
      {
        id: 'processes',
        title: 'Procesos',
        type: 'collapse',
        icon: 'apartment',
        children: [
          { id: 'processes-list', title: 'Ver procesos', type: 'item', url: '/processes/process', classes: 'nav-item' },
          { id: 'processes-add', title: 'Crear proceso', type: 'item', url: '/processes/add-process', classes: 'nav-item' }
        ]
      },
      {
        id: 'risks',
        title: 'Riesgos',
        type: 'collapse',
        icon: 'warning',
        children: [
          { id: 'risks-list', title: 'Ver riesgos', type: 'item', url: '/risks/risk', classes: 'nav-item' },
          { id: 'risks-add', title: 'Crear riesgo', type: 'item', url: '/risks/add-risk', classes: 'nav-item' }
        ]
      },
      {
        id: 'causes',
        title: 'Causas y consecuencias',
        type: 'collapse',
        icon: 'branches',
        children: [
          { id: 'causes-list', title: 'Ver causas', type: 'item', url: '/causes/cause', classes: 'nav-item' },
          { id: 'causes-add', title: 'Crear causa', type: 'item', url: '/causes/add-cause', classes: 'nav-item' }
        ]
      },
      {
        id: 'controls',
        title: 'Controles',
        type: 'collapse',
        icon: 'control',
        children: [
          { id: 'controls-list', title: 'Ver controles', type: 'item', url: '/controls/control', classes: 'nav-item' },
          { id: 'controls-add', title: 'Crear control', type: 'item', url: '/controls/add-control', classes: 'nav-item' },
          { id: 'controls-params', title: 'Parametrización', type: 'item', url: '/controls/params', classes: 'nav-item' }
        ]
      },
      {
        id: 'events',
        title: 'Eventos',
        type: 'collapse',
        icon: 'alert',
        children: [
          { id: 'events-list', title: 'Ver eventos', type: 'item', url: '/events/event', classes: 'nav-item' },
          { id: 'events-add', title: 'Crear evento', type: 'item', url: '/events/add-event', classes: 'nav-item' }
        ]
      },
      {
        id: 'plans',
        title: 'Plan de acción',
        type: 'collapse',
        icon: 'schedule',
        children: [
          { id: 'plans-list', title: 'Ver planes', type: 'item', url: '/plans/plan', classes: 'nav-item' },
          { id: 'plans-add', title: 'Crear plan', type: 'item', url: '/plans/add-plan', classes: 'nav-item' }
        ]
      },
      {
        id: 'evaluations',
        title: 'Evaluaciones',
        type: 'collapse',
        icon: 'audit',
        children: [
          { id: 'evaluations-list', title: 'Ver evaluaciones', type: 'item', url: '/evaluations/evaluation', classes: 'nav-item' },
          { id: 'evaluations-add', title: 'Crear evaluación', type: 'item', url: '/evaluations/add-evaluation', classes: 'nav-item' }
        ]
      },
      {
        id: 'heatmap',
        title: 'Mapa de calor',
        type: 'item',
        url: '/map/map',
        classes: 'nav-item',
        icon: 'heat-map'
      },
      {
        id: 'reports',
        title: 'Reportes',
        type: 'item',
        url: '/reports/report',
        classes: 'nav-item',
        icon: 'bar-chart'
      }
    ]
  }

  /* Comentados por ahora
  {
    id: 'authentication',
    title: 'Authentication',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'register',
        title: 'Register',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
        icon: 'profile',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'utilities',
    title: 'UI Components',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'typography',
        title: 'Typography',
        type: 'item',
        classes: 'nav-item',
        url: '/typography',
        icon: 'font-size'
      },
      {
        id: 'color',
        title: 'Colors',
        type: 'item',
        classes: 'nav-item',
        url: '/color',
        icon: 'bg-colors'
      },
      {
        id: 'ant-icons',
        title: 'Ant Icons',
        type: 'item',
        classes: 'nav-item',
        url: 'https://ant.design/components/icon',
        icon: 'ant-design',
        target: true,
        external: true
      }
    ]
  },
  {
    id: 'other',
    title: 'Other',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/sample-page',
        classes: 'nav-item',
        icon: 'chrome'
      }
    ]
  }
  */
];
