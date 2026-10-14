import Link from "next/link";
import styles from "./NotFoundAnimation.module.css";

export default function NotFoundAnimation({
  homeHref = "/",
  title = "Page Not Found",
  description = "Oops! The page you’re looking for seems to have wandered off.",
}) {
  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbOne}`} />
        <span className={`${styles.orb} ${styles.orbTwo}`} />
        <span className={`${styles.orb} ${styles.orbThree}`} />
        <span className={`${styles.sparkle} ${styles.sparkleOne}`}>✦</span>
        <span className={`${styles.sparkle} ${styles.sparkleTwo}`}>✧</span>
        <span className={`${styles.sparkle} ${styles.sparkleThree}`}>✦</span>
      </div>

      <section className={styles.content} aria-labelledby="not-found-title">
        <div className={styles.scene} aria-label="A little character walking" role="img">
          <div className={styles.number} aria-hidden="true">404</div>

          {/* Original walking-character SVG, animated with CSS Modules. */}
          <div className={styles.notFoundAnimation} aria-hidden="true">
            <svg className={styles.legLeft} viewBox="0 0 30 90">
              <path d="M17 5 C13 25 20 39 14 56 L7 73 C5 79 9 84 16 82 L26 79 C31 77 29 72 24 69 L23 54 C29 35 23 20 25 7 Z"
                fill="#8b5cf6" stroke="#25234a" strokeWidth="4" strokeLinejoin="round" />
            </svg>
            <svg className={styles.legRight} viewBox="0 0 42 90">
              <path d="M10 5 C18 23 13 38 22 53 L29 68 C25 74 19 78 15 83 C13 87 18 89 24 86 L37 78 C41 75 37 70 34 66 L30 49 C30 30 23 17 20 5 Z"
                fill="#60a5fa" stroke="#25234a" strokeWidth="4" strokeLinejoin="round" />
            </svg>
            <div className={styles.body}>
              <svg viewBox="0 0 160 160">
                <path d="M80 13 C43 13 20 40 20 77 C20 99 31 116 44 129 L52 143 L67 136 L81 146 L96 136 L111 141 L119 126 C137 109 143 91 140 70 C137 37 113 13 80 13Z"
                  fill="#fff" stroke="#25234a" strokeWidth="5" strokeLinejoin="round" />
                <path d="M32 81 C35 52 54 31 81 30 C109 30 126 51 128 76 C130 101 117 120 100 129"
                  fill="none" stroke="#c4b5fd" strokeWidth="5" strokeLinecap="round" opacity=".9" />
                <ellipse cx="66" cy="77" rx="9" ry="13" fill="#28204f" />
                <ellipse cx="101" cy="77" rx="9" ry="13" fill="#28204f" />
                <circle cx="69" cy="73" r="3" fill="#fff" />
                <circle cx="104" cy="73" r="3" fill="#fff" />
                <ellipse cx="51" cy="95" rx="8" ry="4" fill="#f0abfc" />
                <ellipse cx="116" cy="95" rx="8" ry="4" fill="#f0abfc" />
              </svg>
            </div>
            <svg className={styles.head} viewBox="0 0 160 100">
              <path d="M22 63 C19 31 42 8 75 8 C107 8 130 29 130 59 L147 72 L128 75 C117 88 99 92 80 89 C49 92 26 81 22 63Z"
                fill="#fff" stroke="#25234a" strokeWidth="5" strokeLinejoin="round" />
              <path d="M33 59 C36 34 53 20 75 20" fill="none" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="68" cy="57" rx="8" ry="12" fill="#28204f" />
              <ellipse cx="99" cy="57" rx="8" ry="12" fill="#28204f" />
              <circle cx="70" cy="53" r="3" fill="#fff" />
              <circle cx="101" cy="53" r="3" fill="#fff" />
              <path d="M84 75 Q91 81 98 74" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className={styles.ground} aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>

        <p className={styles.eyebrow}>LOST IN THE DIGITAL UNIVERSE</p>
        <div id="not-found-title" className={styles.notFoundTitle}>{title}</div>
        <p className={styles.description}>{description}</p>
        <Link className={styles.homeButton} href={homeHref}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.homeIcon}>
            <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" fill="currentColor" />
          </svg>
          <span>Back to home</span>
          <span className={styles.arrow} aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
