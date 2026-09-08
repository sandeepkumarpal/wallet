import "./PageSkeleton.scss";

const Shine = ({ className = "" }: { className?: string }) => (
  <div className={`skel-block skel-shine ${className}`} />
);

export const DashboardSkeleton = () => (
  <div className="page-skel page-skel--dashboard" aria-busy="true" aria-label="Loading dashboard">
    <div className="page-skel__stats">
      <Shine className="page-skel__stat page-skel__stat--accent" />
      <Shine className="page-skel__stat" />
      <Shine className="page-skel__stat" />
      <Shine className="page-skel__stat" />
    </div>
    <Shine className="page-skel__budget-bar" />
    <div className="page-skel__dash-grid">
      <Shine className="page-skel__chart" />
      <Shine className="page-skel__cats" />
    </div>
    <Shine className="page-skel__recent" />
  </div>
);

export const TransactionSkeleton = () => (
  <div className="page-skel page-skel--transactions" aria-busy="true" aria-label="Loading transactions">
    <div className="page-skel__chips">
      <Shine className="page-skel__chip" />
      <Shine className="page-skel__chip" />
      <Shine className="page-skel__chip" />
    </div>
    <div className="page-skel__tx-panel">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="page-skel__tx-row skel-shine">
          <div className="page-skel__tx-main">
            <Shine className="page-skel__tx-title" />
            <Shine className="page-skel__tx-meta" />
          </div>
          <div className="page-skel__tx-side">
            <Shine className="page-skel__tx-amount" />
            <div className="page-skel__tx-actions">
              <Shine className="page-skel__tx-btn" />
              <Shine className="page-skel__tx-btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const BudgetSkeleton = () => (
  <div className="page-skel page-skel--budget" aria-busy="true" aria-label="Loading budget">
    <Shine className="page-skel__hero" />
    <div className="page-skel__form-card skel-shine">
      <Shine className="page-skel__form-title" />
      <Shine className="page-skel__form-sub" />
      <Shine className="page-skel__form-input" />
      <Shine className="page-skel__form-btn" />
    </div>
    <div className="page-skel__cat-card skel-shine">
      <Shine className="page-skel__form-title" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="page-skel__cat-row">
          <Shine className="page-skel__cat-name" />
          <Shine className="page-skel__cat-value" />
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="page-skel page-skel--profile" aria-busy="true" aria-label="Loading profile">
    <div className="page-skel__profile-card skel-shine">
      <Shine className="page-skel__avatar" />
      <div className="page-skel__profile-text">
        <Shine className="page-skel__name" />
        <Shine className="page-skel__email" />
        <Shine className="page-skel__budget-line" />
      </div>
    </div>
    <div className="page-skel__form-card skel-shine">
      <Shine className="page-skel__form-title" />
      <Shine className="page-skel__form-input" />
      <Shine className="page-skel__form-input" />
      <Shine className="page-skel__form-btn" />
    </div>
    <Shine className="page-skel__logout" />
  </div>
);

/** @deprecated use page-specific skeletons */
const PageSkeleton = DashboardSkeleton;
export default PageSkeleton;
