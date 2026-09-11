const LandingHeroVisual = () => (
  <div className="landing-hero__visual" aria-hidden>
    <div className="landing-hero__stage">
      <div className="landing-preview">
        <div className="landing-preview__head">
          <span>March</span>
          <em>On track</em>
        </div>
        <div className="landing-preview__balance">
          <small>Remaining</small>
          <strong>₹24,680</strong>
        </div>
        <div className="landing-preview__bars">
          <div>
            <span>Income</span>
            <b>₹82,000</b>
            <i className="is-income" />
          </div>
          <div>
            <span>Spent</span>
            <b>₹57,320</b>
            <i className="is-expense" />
          </div>
        </div>
        <ul className="landing-preview__list">
          <li>
            <span>Salary</span>
            <em className="is-income">+₹72,000</em>
          </li>
          <li>
            <span>Groceries</span>
            <em className="is-expense">−₹3,420</em>
          </li>
          <li>
            <span>Rent</span>
            <em className="is-expense">−₹18,000</em>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default LandingHeroVisual;
