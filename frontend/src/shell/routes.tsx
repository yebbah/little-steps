import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { NAV_ICON_NAMES } from '../icons/names.ts'
import type { MessageKey } from '../i18n/messages.ts'
import { AppShell } from './AppShell.tsx'
import { NotFoundScreen, Screen } from './Screen.tsx'
import { FamilyScreen, SettingsScreen } from './SettingsScreen.tsx'
import type { ScreenHandle } from './useRouteFocus.ts'

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      ...NAV_ICON_NAMES.filter((name) => name !== 'family').map(
        (name): RouteObject => ({
          path: name,
          element: <Screen titleKey={`nav.${name}` as MessageKey} introKey={`screen.${name}.intro` as MessageKey} />,
          handle: { screenKey: `nav.${name}`, subjectKey: `screen.${name}.subject` } satisfies ScreenHandle,
        }),
      ),
      // Family has a section of its own: Settings (Story 2.9). The Family nav item stays current inside it.
      {
        path: 'family',
        children: [
          {
            index: true,
            element: <FamilyScreen />,
            handle: { screenKey: 'nav.family', subjectKey: 'screen.family.subject' } satisfies ScreenHandle,
          },
          {
            path: 'settings',
            element: <SettingsScreen />,
            handle: { screenKey: 'screen.settings.title', subjectKey: 'screen.settings.subject' } satisfies ScreenHandle,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundScreen />,
        handle: { screenKey: 'screen.notFound.title', subjectKey: 'screen.notFound.subject' } satisfies ScreenHandle,
      },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
