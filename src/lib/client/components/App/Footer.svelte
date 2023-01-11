<script lang="ts">
	import SvgIcon from '$components/SvgIcon/SvgIcon.svelte';

	// Base Classes
	const cRow: string =
		'flex flex-col md:flex-row justify-between items-center md:items-start space-y-4 md:space-y-0';
</script>

<div class="page-footer bg-neutral p-3 text-primary">
	<section class={cRow}>
		<p class="text-xs">
			<a href="/documentation/license/" target="_blank">Flying Pillow License</a>
			<span class="opacity-10 mx-2">|</span>
			<a href="https://github.com/FlyingPillow/contributors" rel="noreferrer" target="_blank"
				>Contributors</a
			>
		</p>
		<div class="flex space-x-4">
			<a class="btn btn-primary" href="https://twitter.com/" rel="noreferrer" target="_blank">
				<SvgIcon name="twitter" fill="fill-white" />
				<span class="hidden md:inline-block ml-2">Twitter</span>
			</a>
			<a
				class="btn btn-primary"
				href="https://github.com/Flying-Pillow"
				rel="noreferrer"
				target="_blank"
			>
				<SvgIcon name="github" fill="fill-white" />
				<span class="hidden md:inline-block ml-2">Github</span>
			</a>
		</div>
	</section>
</div>

<style lang="postcss">
</style>
