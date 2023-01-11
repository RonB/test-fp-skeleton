<script lang="ts">
  import Icon from "@iconify/svelte";
  import SvgIcon from "$components/SvgIcon/SvgIcon.svelte";
</script>

<div class="container max-w-[1200px] mx-auto px-4 py-10 md:py-20 space-y-20">
  <header>
    <div class="space-y-6">
      <h1 class="text-3xl md:text-4xl lg:text-5xl">
        <span
          class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500"
          >Flying Pillow</span
        >
      </h1>
      <h2 class="text-4xl md:text-4xl lg:text-6xl">
        The one-stop shop for AI powered support applications.
      </h2>
      <p class="text-xl">
        Flying Pillow allows you to build fast and reactive AI powered support
        systems <a
          href="https://huggingface.co"
          rel="noreferrer"
          target="_blank">Huggingface</a
        >
      </p>
    </div>
  </header>

  <!-- Features -->
  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <h2 class="sr-only">Features</h2>
    <div class="card card-body space-y-4">
      <div
        class="bg-orange-500 w-14 aspect-square flex justify-center items-center rounded-lg shadow"
      >
        <!-- <SvgIcon name="svelte" fill="fill-white" width="w-10" height="h-10" /> -->
        <Icon icon="ic:close" />
      </div>
      <h4>State of the art technology Integration</h4>
      <p>
        Tightly coupled with Huggingface! Rasa and Haystack including full
        support for <a
          href="https://huggingface.co/"
          rel="noreferrer"
          target="_blank">Huggingface</a
        >,
        <a href="https://www.rasa.com" rel="noreferrer" target="_blank">Rasa</a
        >, and
        <a href="https://haystack.com" rel="noreferrer" target="_blank"
          >Haystack</a
        >.
      </p>
    </div>
    <div class="card card-body space-y-4">
      <div
        class="bg-sky-500 w-14 aspect-square flex justify-center items-center rounded-lg shadow"
      >
        <SvgIcon name="tailwind" fill="fill-white" width="w-10" height="h-10" />
      </div>
      <h4>API Integration</h4>
      <p>
        Integrate all your business logic in your support processes with easy
        API's.
      </p>
    </div>
    <div class="card card-body space-y-4">
      <div
        class="bg-primary-500 w-14 aspect-square flex justify-center items-center rounded-lg shadow"
      >
        <SvgIcon name="swatchbook" fill="fill-white" width="w-8" height="h-8" />
      </div>
      <h4>Dynamic Processes</h4>
      <p>
        Choose from a library of hand crafted processes or quickly generate your
        own in seconds.
      </p>
    </div>
    <div class="card card-body space-y-4">
      <div
        class="bg-accent-500 w-14 aspect-square flex justify-center items-center rounded-lg shadow"
      >
        <SvgIcon
          name="screwdriver"
          fill="fill-white"
          width="w-8"
          height="h-8"
        />
      </div>
      <h4>Powerful Utilities</h4>
      <p>
        Provides a feature rich UI toolkit for modern chatbots, dialogs, and
        more.
      </p>
    </div>
  </section>

  <!-- Team -->
  <section class="text-center space-y-6">
    <h2>Meet The Team</h2>
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <li class="card card-body space-y-2 text-center">
        <img
          alt="x"
          src="https://avatars.githubusercontent.com/u/559779?v=4"
          width="w-24"
          class="mx-auto"
        />
        <h4>Ronald Brinkerink</h4>
        <p>Co-founder and co- contributor.</p>
        <div class="flex justify-center space-x-4">
          <a href="https://github.com/ronb" rel="noreferrer" target="_blank"
            ><SvgIcon name="github" /></a
          >
          <a
            href="https://twitter.com/r_brinkerink"
            rel="noreferrer"
            target="_blank"><SvgIcon name="twitter" /></a
          >
          <a
            href="https://www.linkedin.com/ronaldbrinkerink/"
            rel="noreferrer"
            target="_blank"><SvgIcon name="linkedin" /></a
          >
        </div>
      </li>
      <li class="card card-body space-y-2 text-center">
        <img
          alt="x"
          src="https://avatars.githubusercontent.com/u/2361948?v=4"
          width="w-24"
          class="mx-auto"
        />
        <h4>Roy van der Kuil</h4>
        <p>
          Core member and founder of <a
            href="https://www.flying-pillow.nl"
            rel="noreferrer"
            target="_blank">Flying Pillow</a
          >
        </p>
        <div class="flex justify-center space-x-4">
          <a
            href="https://twitter.com/flying-pillow"
            rel="noreferrer"
            target="_blank"><SvgIcon name="twitter" /></a
          >
          <a
            href="https://www.linkedin.com/company/flying-pillow/"
            rel="noreferrer"
            target="_blank"><SvgIcon name="linkedin" /></a
          >
        </div>
      </li>
      <li class="card card-body space-y-2 text-center">
        <img
          alt="x"
          src="https://avatars.githubusercontent.com/u/115985938?v=4"
          width="w-24"
          class="mx-auto"
        />
        <h4>Maurice Leidelmeijer</h4>
        <p>
          Core member and founder of <a
            href="https://www.flying-pillow.nl"
            rel="noreferrer"
            target="_blank">Flying Pillow</a
          >
        </p>
        <div class="flex justify-center space-x-4">
          <a
            href="https://twitter.com/flying-pillow"
            rel="noreferrer"
            target="_blank"><SvgIcon name="twitter" /></a
          >
          <a
            href="https://www.linkedin.com/company/flying-pillow/"
            rel="noreferrer"
            target="_blank"><SvgIcon name="linkedin" /></a
          >
        </div>
      </li>
    </ul>
  </section>
</div>
