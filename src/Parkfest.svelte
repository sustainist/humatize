<script>
  import Pay from "./funding/cart/Pay.svelte";
  import Checkout from "./funding/checkout/Checkout.svelte";
  import Funding from "./funding/Funding.svelte";
</script>

<svelte:head>
  <title>🌍 Park Fest · Future Invest</title>
  <meta
    name="description"
    content="Join the Park Fest co-investment model: transparent profit-sharing, public participant list, and sustainable event support."
  />
  <meta
    name="keywords"
    content="Park Fest, co-investment, sustainable investments, public list, profit sharing, future economy"
  />
  <meta name="author" content="Future Invest DAO" />
  <meta property="og:title" content="🌍 Future Invest · Park Fest" />
  <meta
    property="og:description"
    content="Join the Park Fest co-investment model: transparent profit-sharing, public participant list, and sustainable event support."
  />
  <meta property="og:image" content="/images/concert.jpg" />
  <meta property="og:url" content="https://futureinvest.org/parkfest" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="🌍 Future Invest · Park Fest" />
  <meta
    name="twitter:description"
    content="Join the Park Fest co-investment model: transparent profit-sharing, public participant list, and sustainable event support."
  />
  <meta name="twitter:image" content="/images/concert.jpg" />
  <!-- Font & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="use-credentials"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
  />
</svelte:head>

<div class="container">
  <!-- future badge -->
  <div class="future-badge">
    <i class="fas fa-leaf"></i>
    <span>✦ future economy · sustainable finance</span>
    <i class="fas fa-seedling" style="margin-left: 0.3rem;"></i>
  </div>

  <h1>
    🌳 Parkfest
    <span style="white-space: nowrap; font-size: 0.7em;">
      <span style="background: none; -webkit-text-fill-color: #bef5e2;">
        · supporter</span
      >
      <span style="background: none; -webkit-text-fill-color: #bef5e2;">
        · investor</span
      >
    </span>
  </h1>
  <div class="subhead">
    <i class="fas fa-music" style="color: #7bc3b0; margin-right: 10px;"></i>

    <span class="highlight">A new way of investing</span> — transparent,
    participatory, and planet‑forward.

    <span class="highlight">This is a MVP of the new investment model. </span>
    <br />
    Work in progress stay tuned...
  </div>

  <!-- main grid -->
  <div class="grid-2col">
    <!-- left: event & QR -->
    <div class="card">
      <h2><i class="fas fa-tree"></i> Park · Stage · Music</h2>
      <p style="margin-bottom: 0.5rem; color: #d0efe4;">
        <i class="fas fa-location-dot" style="color: #6fc0ab;"></i>
        <a
          href="https://geohack.toolforge.org/geohack.php?pagename=Copou_Park&params=47.178678_N_27.56716_E_type:landmark"
          target="_blank"
          rel="noopener noreferrer">Copou Park</a
        >
        &nbsp;&nbsp;
        <i class="fas fa-calendar-day"></i> September 6 · 10:00
      </p>
      <div class="event-detail">
        <span class="event-detail-item"
          ><i class="fas fa-microphone"></i>bands</span
        >
        <span class="event-detail-item"
          ><i class="fas fa-user-astronaut"></i>solo artists</span
        >
        <span class="event-detail-item">
          <i class="fas fa-music"></i> live music</span
        >
      </div>

      <div class="qr-block">
        <div
          style="display: flex; flex-direction: column; align-items: center;"
        >
          <h2>become a supporter · invest</h2>
          <Funding />
          <!-- <div class="qr-placeholder">
            <i class="fas fa-qrcode"></i> SCAN
          </div> -->

          <!-- <p style="margin-top: 0.8rem; font-size: 0.9rem; color: #b5e3d4;">
            <i class="fas fa-hand-holding-heart"></i> Become a supporter
          </p> -->
        </div>
      </div>

      <div
        style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;"
      >
        <div>
          <span
            style="background: #1b4d40; padding: 0.3rem 1rem; border-radius: 30px; font-size: 0.8rem;"
          >
            <i class="fas fa-people-group"></i> 100% give & get back
          </span>
        </div>
        <!-- <a
          href="/#"
          class="btn-support"
          onclick={() => {
            alert(
              "✨ Thank you! You're now part of the future-investment community.",
            );
          }}
        >
          <i class="fas fa-arrow-right"></i> support the event · future invest
        </a> -->

        <Pay />

        <!-- <Checkout /> -->
      </div>

      <div class="invest-note">
        <i class="fas fa-circle-info"></i>
        Support this event and become an <strong>early investor</strong> in the
        next frontier of
        <strong>sustainable finance</strong>.
      </div>
    </div>

    <!-- right: investor / supporter view -->
    <div class="card">
      <h2>
        <i class="fas fa-chart-simple"></i> supporter view · your investments
      </h2>
      <p style="color: #c5e6db; margin-bottom: 1.2rem;">
        See the final participant list &amp; profit shares. <br />
        <span
          style="background: #194a3d; padding: 0.1rem 0.7rem; border-radius: 30px; font-size: 0.8rem;"
        >
          <i class="fas fa-check-circle" style="color: #7bc3b0;"></i> public &amp;
          transparent
        </span>
      </p>
      <div
        style="background: #0f2b25; border-radius: 18px; padding: 0.8rem 1rem; margin-bottom: 0.8rem;"
      >
        <i class="fas fa-scale-balanced"></i>
        <span style="font-weight: 500;"
          >Negotiated &amp; agreed by all participants</span
        >
      </div>
      <p style="font-size: 0.9rem; color: #b5d9ce;">
        <i class="fas fa-people-arrows"></i>
        Investors &amp; supporters decide together the fair split.
      </p>
    </div>
  </div>

  <!-- PUBLIC LIST (participants + shares) -->
  <div class="list-section">
    <div class="list-header">
      <h3>
        <i class="fas fa-list-ul" style="color: #7bc3b0; margin-right: 0.6rem;"
        ></i> participant list · profit shares
      </h3>
      <span class="public-badge"
        ><i class="fas fa-globe"></i> public · live</span
      >
    </div>

    <div class="table-container">
      <table class="list-table">
        <thead>
          <tr>
            <th>Role / Name</th>
            <th>Category</th>
            <th>Profit share</th>
            <th>Reasoning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>🌿 GreenStage Co.</strong></td>
            <td
              ><span class="investor-tag"
                ><i class="fas fa-coins"></i> investor</span
              ></td
            >
            <td class="profit-share">18%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >stage &amp; sound system</td
            >
          </tr>
          <tr>
            <td><strong>🎤 Luna &amp; The Echo</strong></td>
            <td
              ><span class="supporter-tag"
                ><i class="fas fa-hand-holding-heart"></i> supporter</span
              ></td
            >
            <td class="profit-share">12%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >headliner, brings audience</td
            >
          </tr>
          <tr>
            <td><strong>🌱 Park Collective</strong></td>
            <td
              ><span class="investor-tag"
                ><i class="fas fa-coins"></i> investor</span
              ></td
            >
            <td class="profit-share">15%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >venue &amp; permits</td
            >
          </tr>
          <tr>
            <td><strong>🎸 River Bones</strong></td>
            <td
              ><span class="supporter-tag"
                ><i class="fas fa-hand-holding-heart"></i> supporter</span
              ></td
            >
            <td class="profit-share">10%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >original music, social pull</td
            >
          </tr>
          <tr>
            <td><strong>📱 QR tech · DonateFlow</strong></td>
            <td
              ><span class="investor-tag"
                ><i class="fas fa-coins"></i> investor</span
              ></td
            >
            <td class="profit-share">8%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >donation platform &amp; analytics</td
            >
          </tr>
          <tr>
            <td><strong>🧑‍🌾 Community volunteers</strong></td>
            <td
              ><span class="supporter-tag"
                ><i class="fas fa-hand-holding-heart"></i> supporter</span
              ></td
            >
            <td class="profit-share">7%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >setup, eco‑friendly waste</td
            >
          </tr>
          <tr>
            <td><strong>⚡ Future Invest DAO</strong></td>
            <td
              ><span class="investor-tag"
                ><i class="fas fa-coins"></i> investor</span
              ></td
            >
            <td class="profit-share">20%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >risk capital, marketing</td
            >
          </tr>
          <tr>
            <td><strong>🌸 3 local artists</strong></td>
            <td
              ><span class="supporter-tag"
                ><i class="fas fa-hand-holding-heart"></i> supporter</span
              ></td
            >
            <td class="profit-share">10%</td>
            <td style="font-size: 0.85rem; color: #b0d9cc;"
              >art &amp; decoration, vibe</td
            >
          </tr>
        </tbody>
      </table>
    </div>

    <div class="negotiate-note">
      <i class="fas fa-handshake" style="color: #7bc3b0; margin-right: 12px;"
      ></i>
      <strong>Negotiated &amp; agreed</strong> — all participants (investors
      &amp; supporters) met and approved this split. Reasoning: based on
      contribution, risk, and value added.
      <span
        style="display: inline-block; background: #1e4d40; padding: 0.1rem 0.8rem; border-radius: 20px; font-size: 0.8rem; margin-left: 10px;"
      >
        <i class="fas fa-rotate-left"></i> iterative consensus
      </span>
    </div>
  </div>

  <!-- ========== COMMON INPUTS SECTION ========== -->
  <div style="margin: 3rem 0 2rem;">
    <div
      style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.8rem;"
    >
      <i class="fas fa-pen-to-square" style="color: #7bc3b0; font-size: 2rem;"
      ></i>
      <h2 style="color: #d4f5ea; font-weight: 600; font-size: 1.8rem;">
        Join the investment · all input styles
      </h2>
    </div>

    <div class="card" style="padding: 2rem 2.2rem;">
      <form
        onsubmit={(event) => {
          event.preventDefault();
          alert("✨ Your investment profile saved (demo).");
        }}
      >
        <div class="form-grid">
          <!-- text -->
          <div class="input-group">
            <label for="fullname"><i class="fas fa-user"></i> Full name</label>
            <input
              type="text"
              id="fullname"
              placeholder="e.g. Ana Green"
              value="Lena Park"
            />
            <span class="hint"
              ><i
                class="fas fa-asterisk"
                style="color: #58b59a; font-size: 0.5rem;"
              ></i> required</span
            >
          </div>

          <!-- password -->
          <div class="input-group">
            <label for="pass"><i class="fas fa-lock"></i> Password</label>
            <input
              type="password"
              id="pass"
              placeholder="••••••••"
              value="sustainable123"
            />
            <span class="hint"><i class="fas fa-key"></i> min 8 chars</span>
          </div>

          <!-- number -->
          <div class="input-group">
            <label for="amount"
              ><i class="fas fa-coins"></i> Investment amount (€)</label
            >
            <input
              type="number"
              id="amount"
              placeholder="e.g. 150"
              value="250"
              min="10"
              step="5"
            />
            <span class="hint"><i class="fas fa-arrow-up"></i> min 10 €</span>
          </div>

          <!-- select -->
          <div class="input-group">
            <label for="roleSelect"
              ><i class="fas fa-people-group"></i> I want to participate as</label
            >
            <select id="roleSelect">
              <option value="investor">💎 Investor</option>
              <option value="supporter" selected>🌱 Supporter</option>
              <option value="both">🌟 Both (investor + supporter)</option>
              <option value="volunteer">🧑‍🌾 Volunteer</option>
            </select>
          </div>

          <!-- textarea (full width) -->
          <div class="input-group full-width">
            <label for="message"
              ><i class="fas fa-comment"></i> Why do you support this model?</label
            >
            <textarea
              id="message"
              placeholder="Share your thoughts on transparent profit-sharing, sustainability..."
              >I love the idea of co-investing and seeing the public list. It
              builds trust.</textarea
            >
          </div>

          <!-- radio + checkbox inline (full width) -->
          <div class="input-group full-width">
            <label style="margin-bottom: 0.2rem;"
              ><i class="fas fa-radio"></i> Investment preference
              <input type="hidden" name="investType" /></label
            >
            <div class="inline-options">
              <label>
                <input type="radio" name="investType" value="short" checked /> Short‑term
              </label>
              <label>
                <input type="radio" name="investType" value="long" /> Long‑term
              </label>
              <label>
                <input type="radio" name="investType" value="hybrid" /> Hybrid
              </label>
            </div>
          </div>

          <div class="input-group full-width">
            <label style="margin-bottom: 0.2rem;"
              ><i class="fas fa-check-square"></i> Agreements
              <input type="hidden" name="agreements" /></label
            >
            <div class="inline-options">
              <label>
                <input type="checkbox" checked /> I accept the public list &amp;
                transparent split
              </label>
              <label>
                <input type="checkbox" /> I will negotiate fairly
              </label>
              <label>
                <input type="checkbox" checked /> I support the sustainable planet
                goal
              </label>
            </div>
          </div>

          <!-- button & extra (full width) -->
          <div
            class="input-group full-width"
            style="flex-direction: row; flex-wrap: wrap; gap: 1rem; align-items: center; margin-top: 0.5rem;"
          >
            <button type="submit" class="btn-primary"
              ><i class="fas fa-rocket"></i> submit investment</button
            >
            <button
              type="reset"
              class="btn-primary"
              style="background: #2e6b5c; box-shadow: 0 5px 0 #1a473d;"
              >reset</button
            >
            <span style="font-size: 0.8rem; color: #93caba;"
              ><i class="fas fa-shield-alt"></i> demo · all inputs styled</span
            >
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- investment philosophy -->
  <div
    style="display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: space-between; background: rgba(0, 26, 22, 0.4); backdrop-filter: blur(4px); border-radius: 28px; padding: 1.8rem 2rem; border: 1px solid #2b6757; margin: 1.8rem 0;"
  >
    <div style="flex: 1; min-width: 200px;">
      <i class="fas fa-rocket" style="color: #7bc3b0; font-size: 1.8rem;"></i>
      <h4 style="margin: 0.3rem 0; color: #d6f5ea;">For potential investors</h4>
      <p style="color: #c2e3d8; font-size: 0.95rem;">
        See the list, evaluate the split, decide if it’s worth investing. Every
        supporter becomes an investor for the next event.
      </p>
    </div>
    <div style="flex: 1; min-width: 200px;">
      <i class="fas fa-eye" style="color: #7bc3b0; font-size: 1.8rem;"></i>
      <h4 style="margin: 0.3rem 0; color: #d6f5ea;">For supporters</h4>
      <p style="color: #c2e3d8; font-size: 0.95rem;">
        Check the approach, the public list, and support the event. You’re part
        of a new transparent investment model.
      </p>
    </div>
    <div style="flex: 1; min-width: 200px;">
      <i class="fas fa-seedling" style="color: #7bc3b0; font-size: 1.8rem;"></i>
      <h4 style="margin: 0.3rem 0; color: #d6f5ea;">Test a new model</h4>
      <p style="color: #c2e3d8; font-size: 0.95rem;">
        <span class="highlight">At least a cool event</span> —
        <span class="highlight">most: a new way of investing</span> that builds community
        &amp; sustainability.
      </p>
    </div>
  </div>

  <div class="footer-note">
    <span><i class="fas fa-check-circle"></i> public list · live</span>
    <span
      ><i class="fas fa-hand-holding-usd"></i> profit split agreed by all</span
    >
    <span><i class="fas fa-globe-americas"></i> future sustainable planet</span>
    <span class="pill"><i class="fas fa-qrcode"></i> scan &amp; support</span>
  </div>

  <div
    style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #689e8c; border-top: 1px solid #1e4d40; padding-top: 1.5rem;"
  >
    <i class="fas fa-arrow-trend-up"></i>
    new investment paradigm · transparent · participatory · planet first
  </div>

  <!-- ===== DEMO BLOCK: New styles for a, headings, and p ===== -->
  <div
    style="margin: 4rem 0 2rem; padding-top: 2rem; border-top: 2px solid #2a6455;"
  >
    <div
      style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem;"
    >
      <i class="fas fa-palette" style="color: #7bc3b0; font-size: 1.8rem;"></i>
      <h3 style="margin: 0; color: #d4f5ea;">Styled elements: a · h1–h6 · p</h3>
      <span
        style="background: #1b4d40; padding: 0.2rem 1rem; border-radius: 30px; font-size: 0.75rem; color: #b5e3d4;"
      >
        <i class="fas fa-code"></i> new styles applied
      </span>
    </div>

    <div class="card" style="padding: 2rem 2.2rem;">
      <!-- Headings h1–h6 -->
      <div style="margin-bottom: 2rem;">
        <h4
          style="color: #7bc3b0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem;"
        >
          <i class="fas fa-heading"></i> Headings (h1 – h6)
        </h4>
        <div
          style="display: grid; gap: 0.8rem; background: rgba(0, 20, 18, 0.3); padding: 1.2rem 1.5rem; border-radius: 16px; border: 1px solid #1f5a4b;"
        >
          <h1>h1. Future Sustainable Planet</h1>
          <h2>h2. Parkfest Investment Model</h2>
          <h3>h3. Transparent Profit Sharing</h3>
          <h4>h4. Participant List &amp; Negotiation</h4>
          <h5>h5. Community Voting</h5>
          <h6>h6. Quarterly Reports</h6>
        </div>
      </div>

      <!-- Paragraphs p -->
      <div style="margin-bottom: 2rem;">
        <h4
          style="color: #7bc3b0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem;"
        >
          <i class="fas fa-paragraph"></i> Paragraph (p)
        </h4>
        <div
          style="background: rgba(0, 20, 18, 0.3); padding: 1.2rem 1.5rem; border-radius: 16px; border: 1px solid #1f5a4b;"
        >
          <p>
            This is a standard paragraph. The event is free to attend, and
            everyone is welcome. The QR code makes it easy to become a supporter
            and investor.
          </p>
          <p>
            Here's another paragraph with more details. The profit is split
            amongst all involved based on a negotiated agreement that is
            transparent and public.
          </p>
          <p class="small">
            This is a <strong>small</strong> paragraph variant (class="small"). Useful
            for footnotes or secondary text.
          </p>
          <p class="muted">
            This is a <strong>muted</strong> paragraph variant (class="muted"). Great
            for less prominent information.
          </p>
        </div>
      </div>

      <!-- Anchor links a -->
      <div>
        <h4
          style="color: #7bc3b0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem;"
        >
          <i class="fas fa-link"></i> Anchor links (a)
        </h4>
        <div
          style="background: rgba(0, 20, 18, 0.3); padding: 1.2rem 1.5rem; border-radius: 16px; border: 1px solid #1f5a4b; display: flex; flex-wrap: wrap; gap: 1.5rem 2.5rem; align-items: center;"
        >
          <a href="/#">Default link style</a>
          <a href="/#">Bold link</a>
          <a href="/#">Small link</a>
          <a href="/#">Large link</a>
          <a href="/#" style="border-bottom: 2px solid #7bc3b0;"
            >With underline</a
          >
          <a
            href="/#"
            style="background: rgba(123, 195, 176, 0.1); padding: 0.2rem 1rem; border-radius: 20px; border-bottom: none;"
            >Button-like link</a
          >
          <span style="color: #8fc0b2; font-size: 0.8rem;">
            <i class="fas fa-arrow-pointer"></i> Hover to see effect
          </span>
        </div>
      </div>

      <!-- Combined example -->
      <div
        style="margin-top: 2rem; background: rgba(123, 195, 176, 0.05); padding: 1.2rem 1.5rem; border-radius: 16px; border-left: 4px solid #7bc3b0;"
      >
        <h4 style="margin-bottom: 0.3rem;">💡 Combined example</h4>
        <p style="margin-bottom: 0.3rem;">
          <a href="/#">This link</a> is placed inside a paragraph. All styles
          work together seamlessly. You can also have
          <a href="/#" style="font-weight: 600;">emphasized links</a> inside text.
        </p>
        <p class="muted" style="font-size: 0.85rem;">
          <i class="fas fa-info-circle"></i>
          Hover over any link to see the transition effect.
        </p>
      </div>
    </div>
  </div>
</div>
