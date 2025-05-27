import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const templateValidatorUiPlugin = createPlugin({
  id: 'template-validator-ui',
  routes: {
    root: rootRouteRef,
  },
});

export const TemplateValidatorUiPage = templateValidatorUiPlugin.provide(
  createRoutableExtension({
    name: 'TemplateValidatorUiPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);

export { TemplateValidatorDashboard as TemplateValidatorPage } from './components/TemplateValidatorDashboard';
