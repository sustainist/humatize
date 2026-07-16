<script>
    import { slide } from "svelte/transition";
    import { showBackThisProjectContent } from "./funding";
    import BackThisProjectButton from "./funding/BackThisProjectButton.svelte";
    import Funding from "./funding/Funding.svelte";
    import Backers from "./project/backers/Backers.svelte";
    import Creators from "./project/creators/Creators.svelte";
    import Session from "./funding/checkout/Session.svelte";
</script>

<svelte:head>
    <title
        >FastFest | The Shortest Route from Dream to Reality | Music Edition</title
    >
    <meta
        name="description"
        content="FastFest is a music-driven community project built on the fast track
        principle: master the smallest step to move forward the fastest. A
        composer writes the simplest band-ready song. Players learn their parts
        quickly. They meet, rehearse, and perform - fast. This is the shortest
        route from dream to reality."
    />
    <meta
        name="keywords"
        content="Humatize, Humanize to Monetize, FastFest, fastest festival, sustainable crowdfunding, public list, profit sharing, future economy"
    />
    <meta
        property="og:title"
        content="FastFest | The Shortest Route from Dream to Reality | Music Edition"
    />
    <meta
        property="og:description"
        content="FastFest is a music-driven community project built on the fast track
        principle: master the smallest step to move forward the fastest. A
        composer writes the simplest band-ready song. Players learn their parts
        quickly. They meet, rehearse, and perform - fast. This is the shortest
        route from dream to reality."
    />
    <meta property="og:image" content="/images/concert.jpg" />
    <meta property="og:url" content="https://futureinvest.org/parkfest" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="🌍 Future Invest · FastFest" />
    <meta
        name="twitter:description"
        content="FastFest is a music-driven community project built on the fast track
        principle: master the smallest step to move forward the fastest. A
        composer writes the simplest band-ready song. Players learn their parts
        quickly. They meet, rehearse, and perform - fast. This is the shortest
        route from dream to reality."
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
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
    />
</svelte:head>

<Session />

<div class="sticky-header" id="stickyHeader">
    <div class="sticky-header-inner">
        <div
            style="flex:1;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        >
            <span class="brand-icon"><i class="fas fa-tree"></i></span>
            <span class="brand-text">FastFest</span>
            <span>|</span>
            <span class="brand-text"
                >The Shortest Route from Dream to Reality</span
            >
        </div>
        <div class="sticky-header-right">
            <BackThisProjectButton />
        </div>
    </div>
    {#if $showBackThisProjectContent}
        <div transition:slide class="container">
            <br />
            <Funding />
            <br />
        </div>
    {/if}
</div>

<div class="container">
    <div class="future-badge">
        <i class="fas fa-leaf"></i>
        <a href="/#humatize-manifest" style="white-space: nowrap;">✦ Humatize</a
        >
        <span>|</span>
        <a href="/#sustainable-crowdfunding">Sustainable Crowdfunding</a>
        <i class="fas fa-seedling"></i>
    </div>
</div>

<div class="container">
    <h1 class="project-title">
        <i class="fa-solid fa-tree"></i> FastFest
    </h1>
    <h2 class="project-subtitle">The Shortest Route from Dream to Reality</h2>
</div>

<div class="container">
    <div class="project-description">
        <p>
            FastFest is a music-driven community project built on the fast track
            principle: master the smallest step to move forward the fastest. A
            composer writes the simplest band-ready song. Players learn their
            parts quickly. They meet, rehearse, and perform - fast. This is the
            shortest route from dream to reality.
        </p>

        <p>
            FastFest is the very first real-world <a href="/#humatize-manifest"
                >Humatize</a
            > project.
        </p>
    </div>
</div>

<div class="grid-2col">
    <div class="card">
        <h2 id="creators"><i class="fas fa-leaf"></i> Creators</h2>
        <Creators />
    </div>
    <div class="card">
        <h2 class="backers"><i class="fas fa-seedling"></i> Backers</h2>
        <Backers />
    </div>
</div>
