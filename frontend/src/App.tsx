import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ModeProvider } from './lib/ModeContext'
import { SiteProvider } from './lib/SiteContext'
import { ViewerProvider } from './lib/ViewerContext'
import { AppLayout } from './layout/AppLayout'
import { RequireModerator } from './layout/RequireModerator'
import { HomePage } from './pages/HomePage'
import { LivePage } from './pages/LivePage'
import { VotesPage } from './pages/VotesPage'
import { GamesPage } from './pages/GamesPage'
import { GamePage } from './pages/GamePage'
import { SquadPage } from './pages/SquadPage'
import { MusicPage } from './pages/MusicPage'
import { DEFAULT_CATEGORY } from './lib/categories'
import { ControlRoomPage } from './pages/ControlRoomPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <ModeProvider>
      <SiteProvider>
        <ViewerProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="games/:gameId/:section?" element={<GamePage />} />
                <Route path="squad" element={<SquadPage />} />
                <Route path="music" element={<MusicPage />} />
                <Route path="live" element={<LivePage />} />
                <Route path="votes" element={<Navigate to={`/votes/${DEFAULT_CATEGORY}`} replace />} />
                <Route path="votes/:category" element={<VotesPage />} />
                <Route
                  path="control"
                  element={
                    <RequireModerator>
                      <ControlRoomPage />
                    </RequireModerator>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ViewerProvider>
      </SiteProvider>
    </ModeProvider>
  )
}
