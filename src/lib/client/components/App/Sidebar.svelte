<script lang="ts">
  import { page } from "$app/stores";
  import { writable, type Writable } from "svelte/store";
  import type { ContentType } from "$lib/types";
  import { menuNavLinks } from "./links";
  import { AppRail, drawerStore } from "@skeletonlabs/skeleton";
  import Icon from "@iconify/svelte";

  // Stores
  import { storeCurrentUrl } from "$components/App/stores";

  // Props
  export let embedded = false;

  // Local
  const storeCategory: Writable<string> = writable(menuNavLinks[0].id);

  // test:
  // the content for the documentation catecory is dynamic
  // let docs = $page.data.menu.documentation.map((content: ContentType) => {
  // 	return {
  // 		id: content.id,
  // 		label: content.title,
  // 		href: `/documentation/${content.title}`
  // 	};
  // });
  // if (docs.length === 0) {
  // 	docs = [
  // 		{
  // 			href: '/documentation/new',
  // 			label: 'Add documentation',
  // 			icon: 'mdi:file-document-plus'
  // 		}
  // 	];
  // }
  // menuNavLinks[2].list = docs;

  let filteredMenuNavLinks: any[] = menuNavLinks;

  // ListItem Click Handler
  function onListItemClick(): void {
    // On Drawer embed Only:
    if (!embedded) return;
    drawerStore.close();
  }

  function setNavCategory(c: string): void {
    storeCategory.set(c);
    filteredMenuNavLinks = menuNavLinks.filter(
      (linkSet: any) => linkSet.id === c
    );
  }

  function drawerClose(): void {
    drawerStore.close();
  }
  // Lifecycle
  page.subscribe((p) => {
    let pathMatch: string = p.url.pathname.split("/")[1];
    if (!pathMatch) pathMatch = menuNavLinks[0].id;
    setNavCategory(pathMatch);
  });

  storeCategory.subscribe((c: string) => {
    setNavCategory(c);
  });

  // Reactive
  $: classesActive = (href: string) =>
    $storeCurrentUrl?.includes(href) ? "bg-primary-active-token" : "";
</script>

<div
  class="h-[100%] w-[100%] flex dark:bg-surface-900 bg-surface-100 border-r border-black/5 dark:border-white/5
	{$$props.class ?? ''}"
>
  <!-- App Rail -->
  <AppRail
    selected={storeCategory}
    background="bg-surface-300 dark:bg-surface-700"
  >
    {#each menuNavLinks as category}
      <button
        on:click={() => {
          setNavCategory(category.id);
        }}
        class="flex flex-col items-center w-24 p-3 hover:bg-primary-400 {$storeCategory ==
        category.id
          ? 'bg-primary-500'
          : ''}"
      >
        <Icon icon={category.icon} width="40" class="mt-auto" />
        <span class="text-xs">{category.title}</span>
      </button>
    {/each}
  </AppRail>
  <!-- Nav Links -->
  <section class="p-4 space-y-4 overflow-y-auto w-56">
    {#each filteredMenuNavLinks as { id, title, list }, i}
      {#if list.length > 0}
        <!-- Title -->
        <div {id} class="text-primary-500 font-bold uppercase p-4 pb-0">
          {title}
        </div>
        <!-- Navigation List -->
        <nav class="list-nav">
          <ul>
            {#each list as { href, target, label, badge, icon }}
              <li on:click={onListItemClick} on:keypress>
                <a
                  {href}
                  {target}
                  class={classesActive(href)}
                  data-sveltekit-preload-data="hover"
                  on:click={drawerClose}
                >
                  {#if icon}<Icon {icon} />{/if}
                  <span class="flex-auto">{label}</span>
                  {#if badge}<span class="badge badge-filled-accent"
                      >{badge}</span
                    >{/if}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
        <!-- Divider -->
        {#if i + 1 < filteredMenuNavLinks.length}<hr
            class="!my-6 opacity-50"
          />{/if}
      {/if}
    {/each}
  </section>
</div>
