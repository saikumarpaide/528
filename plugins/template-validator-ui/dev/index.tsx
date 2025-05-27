import { createDevApp } from '@backstage/dev-utils';
import { templateValidatorUiPlugin, TemplateValidatorUiPage } from '../src/plugin';

createDevApp()
  .registerPlugin(templateValidatorUiPlugin)
  .addPage({
    element: <TemplateValidatorUiPage />,
    title: 'Root Page',
    path: '/template-validator-ui',
  })
  .render();
