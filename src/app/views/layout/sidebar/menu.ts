import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'Inicio',
    isTitle: true
  },
  {
    label: 'Dashboard',
    icon: 'home',
    link: '/dashboard'
  },
  {
    label: 'Administación',
    isTitle: true
  },
  {
    label: 'Usuarios',
    icon: 'users',
    subItems: [
      {
        label: 'Listado',
        link: '/users',
      }
    ]
  },
  {
    label: 'Roles de seguridad',
    icon: 'users',
    subItems: [
      {
        label: 'Ver roles',
        link: '/roles/rol',
      }
    ]
  },
  {
    label: 'Contraseña',
    icon: 'users',
    subItems: [
      {
        label: 'Cambiar contraseña',
        link: '/password/change-pass',
      }
    ]
  },
  {
    label: 'MODULOS',
    isTitle: true
  },
  {
    label: 'Proyectos',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver proyectos',
        link: '/projects/project',
      }
    ]
  },
  {
    label: 'Procesos',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver procesos',
        link: '/processes/process',
      }
    ]
  },
  {
    label: 'Riesgos',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver riesgos',
        link: '/risks/risk',
      }
    ]
  },
  {
    label: 'Causas Consecuencias',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver causas',
        link: '/causes/cause',
      }
    ]
  },
  {
    label: 'Controles',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver Controles',
        link: '/controls/control',
      },
      {
        label: 'Parametrización',
        link: '/controls/params',
      }
    ],
  },
  {
    label: 'Eventos',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver eventos',
        link: '/events/event',
      }
    ]
  },
  {
    label: 'Plan de acción',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver planes',
        link: '/plans/plan',
      }
    ]
  },
  {
    label: 'Evaluaciones',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Ver evaluaciones',
        link: '/evaluations/evaluation',
      }
    ]
  },
  {
    label: 'Mapa de Calor',
    icon: 'briefcase',
    subItems: [
      {
        label: 'Parametrización',
        link: '/map',
      }
    ]
  }
];
