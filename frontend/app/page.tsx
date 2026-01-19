import Link from "next/link";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      
      
      {/* VIDEO BACKGROUND */}
      <video
        className={styles.videoBg}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/172529-847499878_small.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY (for readability) */}
      <div className={styles.overlay} />

  
  
      {/* Decorative layers */}
      <div className={styles.grid} />
      <div className={styles.spotlight} />
      <div className={`${styles.blob} ${styles.blobA}`} />
      <div className={`${styles.blob} ${styles.blobB}`} />
      <div className={`${styles.blob} ${styles.blobC}`} />

      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brandRow}>
            <div className={styles.logoMark}>
              <div className={styles.logoInner} />
            </div>
            <div>
              <div className={styles.brandName}>SkillTrajectory</div>
              <div className={styles.brandTag}>Impact of AI on Agile Productivity</div>
            </div>
          </div>

          <nav className={styles.nav}>
            <Link className={styles.navLink} href="/login">User</Link>
            <Link className={styles.navLink} href="/admin/login">Admin</Link>
            <Link className={styles.navPrimary} href="/register">Create account</Link>
          </nav>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.kicker}>Interview Readiness Platform</div>

            <h1 className={styles.title}>
              Measure, improve, and track your readiness with timed tests, gaps, and personalised plans.
            </h1>

            <p className={styles.subtitle}>
              SkillTrajectory combines assessments, explainable readiness levels, skill-gap analytics, and study-plan milestones.
              Continue as a learner or sign in as admin to curate the question bank and monitor usage trends.
            </p>

            <div className={styles.ctaRow}>
              <Link className={styles.ctaPrimary} href="/login">
                Continue as User <span className={styles.arrow}>→</span>
              </Link>

              <Link className={styles.ctaGhost} href="/admin/login">
                Continue as Admin
              </Link>

              <Link className={styles.ctaLink} href="/register">
                New here? Create an account
              </Link>
            </div>

            <div className={styles.trustRow}>
              <div className={styles.trustChip}>JWT + HttpOnly Cookies</div>
              <div className={styles.trustChip}>Section-based tests</div>
              <div className={styles.trustChip}>Readiness + explainability</div>
              <div className={styles.trustChip}>Milestones + progress</div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Choose your workspace</div>
                  <div className={styles.panelMeta}>Start in under 10 seconds</div>
                </div>
                <div className={styles.pulseDot} />
              </div>

              <div className={styles.cards}>
                <Link href="/login" className={styles.card}>
                  <div className={styles.cardIcon}>👤</div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>User Portal</div>
                    <div className={styles.cardText}>
                      Start tests, view readiness, identify weak areas, generate plans, track progress.
                    </div>
                  </div>
                  <div className={styles.cardArrow}>→</div>
                </Link>

                <Link href="/admin/login" className={styles.card}>
                  <div className={styles.cardIcon}>🛡️</div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>Admin Console</div>
                    <div className={styles.cardText}>
                      Manage question bank, activate tests, review analytics and trends.
                    </div>
                  </div>
                  <div className={styles.cardArrow}>→</div>
                </Link>

                <Link href="/register" className={styles.cardSoft}>
                  <div className={styles.cardIcon}>✨</div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>Create Account</div>
                    <div className={styles.cardText}>
                      Register with email + password to begin your SkillTrajectory journey.
                    </div>
                  </div>
                  <div className={styles.cardArrow}>→</div>
                </Link>
              </div>

              <div className={styles.panelFooter}>
                <div className={styles.footerLine}>
                  <span className={styles.footerKey}>Tip</span>
                  <span className={styles.footerVal}>
                    After your first attempt, your dashboard will automatically populate with score, readiness and gaps.
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.miniGrid}>
              <div className={styles.mini}>
                <div className={styles.miniLabel}>Assessments</div>
                <div className={styles.miniValue}>Timed</div>
                <div className={styles.miniHint}>Real interview style</div>
              </div>
              <div className={styles.mini}>
                <div className={styles.miniLabel}>Analytics</div>
                <div className={styles.miniValue}>Explainable</div>
                <div className={styles.miniHint}>Transparent rules</div>
              </div>
              <div className={styles.mini}>
                <div className={styles.miniLabel}>Planning</div>
                <div className={styles.miniValue}>Milestones</div>
                <div className={styles.miniHint}>Week-by-week goals</div>
              </div>
              <div className={styles.mini}>
                <div className={styles.miniLabel}>Progress</div>
                <div className={styles.miniValue}>Tracked</div>
                <div className={styles.miniHint}>Checkbox completion</div>
              </div>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.footerBrand}>SkillTrajectory</span>
            <span className={styles.footerSep}>•</span>
            <span className={styles.footerMuted}>Local development</span>
          </div>

          <div className={styles.footerRight}>
            <span className={styles.footerMuted}>Designed By :</span>
            <span className={styles.footerMuted}>Samiksha Kad</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
