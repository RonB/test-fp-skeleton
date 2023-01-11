<script lang="ts">
	import { storeDrawer } from '$src/routes/(client)/stores';
	// Slots
	/**
	 * @slot header - Insert fixed header content.
	 * @slot sidebar - Hidden when empty. Allows you to set fixed left sidebar content.
	 * @slot pageHeader - Insert content that resides above your page content. Great for global alerts.
	 * @slot pageFooter - Insert content that resides below your page content. Recommended for most layouts.
	 * @slot footer - Insert fixed footer content. Not recommended for most layouts.
	 */

	// Props (regions)
	/** Classes to apply to the <code>header</code> slot container element */
	export let slotHeader: string = '';
	/** Classes to apply to the <code>sidebar</code> slot container element */
	export let slotSidebar: string = 'w-auto';
	/** Classes to apply to the <code>pageHeader</code> slot container element */
	export let slotPageHeader: string = '';
	/** Classes to apply to the <code>pageContent</code> slot container element */
	export let slotPageContent: string = '';
	/** Classes to apply to the <code>pageFooter</code> slot container element */
	export let slotPageFooter: string = '';
	/** Classes to apply to the <code>footer</code> slot container element */
	export let slotFooter: string = '';
</script>

<main id="appShell" data-testid="app-shell" class="h-full flex flex-col overflow-hidden">
	<!-- Slot: Header -->
	{#if $$slots.header}
		<header id="shell-header" class="flex-none {slotHeader}"><slot name="header" /></header>
	{/if}
	<!-- Content Area -->
	<div class="drawer drawer-mobile">
		<input id="drawer" type="checkbox" class="drawer-toggle" bind:checked={$storeDrawer} />
		<!-- Page -->
		<div id="page" class="drawer-content overflow-hidden flex flex-col">
			<!-- Slot: Page Header -->
			{#if $$slots.pageHeader}
				<header id="page-header" class="flex-none {slotPageHeader}">
					<slot name="pageHeader">(slot:header)</slot>
				</header>
			{/if}
			<!-- Slot: Page Content (default) -->
			<div id="page-content" class="flex-1 {slotPageContent}"><slot /></div>
			<!-- Slot: Page Footer -->
			{#if $$slots.pageFooter}
				<footer id="page-footer" class="flex-none {slotPageFooter}">
					<slot name="pageFooter">(slot:footer)</slot>
				</footer>
			{/if}
		</div>
		<!-- Slot: Sidebar -->
		{#if $$slots.sidebar}
			<div class="drawer-side">
				<label for="drawer" class="drawer-overlay" />
				<aside id="sidebar" class={slotSidebar}><slot name="sidebar" /></aside>
			</div>
		{/if}
	</div>
	{#if $$slots.footer}
		<footer id="shell-footer" class="flex-none"><slot name="footer" /></footer>
	{/if}
</main>
