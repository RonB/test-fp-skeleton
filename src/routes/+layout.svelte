<script lang="ts">
  import "@skeletonlabs/skeleton/themes/theme-skeleton.css";
  import "@skeletonlabs/skeleton/styles/all.css";
  import "../app.postcss";
  import {
    Avatar,
    LightSwitch,
    Drawer,
    drawerStore,
    AppBar,
    AppShell,
    Modal,
    menu,
  } from "@skeletonlabs/skeleton";
  import Icon from "@iconify/svelte";
  import ChatBox from "$components/ChatBox/ChatBox.svelte";
  import Sidebar from "$components/App/Sidebar.svelte";
  import { signOut } from "@auth/sveltekit/client";
  // Drawer Handler
  function drawerOpen(): void {
    drawerStore.open({});
  }
  import { page } from "$app/stores";
</script>

<ChatBox />
<Modal />
<Drawer>
  <Sidebar />
</Drawer>

<!-- App Shell -->
<AppShell slotSidebarLeft="flex flex-col bg-surface-500 w-0 lg:w-80">
  <svelte:fragment slot="header">
    <!-- App Bar -->
    <AppBar>
      <svelte:fragment slot="lead">
        <button on:click={drawerOpen} class="lg:hidden btn btn-sm mr-4">
          <Icon height="32" icon="mdi:menu" />
        </button>
        <a
          href="/"
          class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-accent-800"
        >
          Flying Pillow</a
        >
      </svelte:fragment>

      <svelte:fragment slot="trail">
        {#if $page.data?.session}
          <span class="relative">
            <button class="btn flex gap-1" use:menu={{ menu: "user" }}>
              <span
                >{$page.data.session?.user?.name ??
                  $page.data.session?.user?.email}</span
              >
              {#if $page.data.session.user?.image}
                <Avatar width="w-7" src={$page.data.session?.user?.image} />
              {/if}
            </button>
            <nav class="list-nav card p-2 w-48 shadow-xl" data-menu="user">
              <ul>
                <li>
                  <a href="/user/settings">
                    <Icon icon="ic:baseline-settings" />
                    <span>Settings</span>
                  </a>
                </li>
                <li>
                  <button on:click={signOut} class="option w-full">
                    <Icon icon="ic:baseline-log-out" />
                    <span>Signout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </span>
        {:else}
          <a
            href="/login"
            class="btn btn-sm"
            rel="noreferrer"
            aria-label="Login"
          >
            <Icon height="32" icon="ic:round-person" />
          </a>
        {/if}
        <LightSwitch />
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <Sidebar />
  </svelte:fragment>
  <!-- Page Route Content -->
  <slot />
</AppShell>
