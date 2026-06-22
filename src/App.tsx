import { Route, Routes } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import { ApplicationGate, ApplicationPage } from './pages/ApplicationPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfileGate, ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { RegisterPage } from './pages/RegisterPage'
import { VarsityCalculatorPage } from './pages/VarsityCalculatorPage'
import { VarsityGuidePage } from './pages/VarsityGuidePage'
import { StudentHubPage } from './pages/StudentHubPage'
import { VarsityProspectusHubPage } from './pages/VarsityProspectusHubPage'
import { ApplicationPdfPreviewPage } from './pages/ApplicationPdfPreviewPage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { PastPapersPage } from './pages/PastPapersPage'
import { CareerProgrammesPage } from './pages/CareerProgrammesPage'
import { AboutPage } from './pages/AboutPage'
import { TermsPage } from './pages/TermsPage'
import { ContactPage } from './pages/ContactPage'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/varsity-calculator" element={<VarsityCalculatorPage />} />
      <Route path="/programmes-for-work" element={<CareerProgrammesPage />} />
      <Route path="/hubs/:hubSlug" element={<StudentHubPage />} />
      <Route path="/varsity-guides/uni/:universityId" element={<VarsityProspectusHubPage />} />
      <Route path="/varsity-guides/:guideId" element={<VarsityGuidePage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={
          <ProfileGate>
            <ProfilePage />
          </ProfileGate>
        }
      />
      <Route
        path="/application"
        element={
          <ApplicationGate>
            <ApplicationPage />
          </ApplicationGate>
        }
      />
      <Route path="/past-papers" element={<PastPapersPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route
        path="/profile/application-pdf"
        element={
          <ProfileGate>
            <ApplicationPdfPreviewPage mode="student" />
          </ProfileGate>
        }
      />
      <Route
        path="/admin/students/:studentId/application-pdf"
        element={<ApplicationPdfPreviewPage mode="admin" />}
      />
    </Routes>
    </>
  )
}
