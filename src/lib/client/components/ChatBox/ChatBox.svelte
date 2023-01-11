<script lang="ts">
	import { page } from '$app/stores';
	import { afterUpdate, onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	//import BouncingBalls from './BouncingBalls.svelte';

	import { create } from '$lib/client/factory';
	import { Conversation } from '$lib/client/models';

	// conversation object instantiated when sending first message
	let conversation: Conversation;

	$: text = '';
	$: visible = false;
	$: maximized = false;

	// for auto scrolling
	let message_box: HTMLDivElement;

	function enter(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			send(text);
		}
	}

	async function start() {
		if (!conversation) {
			conversation = await create(Conversation, {});
			debugger;
			// voorlopig met port.. dit moet anders... zie pubsubserver.ts
			const host = $page.url.hostname + ':7001';
			await conversation.connect(host);
		}
		visible = true;
	}

	function send(text: string) {
		if (text && conversation) {
			conversation.send(text);
			text = '';
		}
	}

	let text_input: HTMLInputElement;

	onMount(() => {});

	afterUpdate(() => {
		if (message_box) scrollToBottom(message_box);
	});

	$: if (message_box) {
		scrollToBottom(message_box);
	}

	const scrollToBottom = (node: HTMLDivElement) => {
		text_input.focus();
		node.scroll({
			top: node.scrollHeight,
			behavior: 'smooth'
		});
	};
</script>

{#if !visible}
	<button on:click={start} class="z-50 fixed bottom-8 right-10">
		<Icon icon="line-md:reddit-loop" class="big-icon" height="72" />
	</button>
{:else}
	<div
		class="z-50 flex flex-col shadow-lg bg-surface-200 dark:bg-surface-800 {maximized
			? 'w-[100%] h-[100%]'
			: 'fixed rounded-lg min-w-[300px] w-1/2 h-2/3 bottom-3 right-3'} "
	>
		<nav class="flex-none m-2 p-1 flex gap-1 border-b-1 border-gray-600">
			<span class="flex-1">
				<img
					src="https://keizers.nu/wp-content/uploads/2020/04/Keizers-Haaksbergen-Logo-1.svg"
					alt=""
					class="h-8"
				/>
			</span>
			<button class="btn btn-sm btn-filled-surface" on:click={() => (maximized = !maximized)}
				><Icon
					height="24"
					icon={maximized ? 'ic:baseline-minimize' : 'ic:baseline-maximize'}
				/></button
			>
			<button class="btn btn-sm btn-filled-surface" on:click={() => (visible = false)}
				><Icon height="24" icon="ic:baseline-close" /></button
			>
		</nav>

		<hr />

		<div class="flex-1 m-3 rounded-lg justify-between overflow-y-auto flex flex-col">
			<div
				bind:this={message_box}
				class="flex-1 space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch rounded-lg"
			>
				{#if conversation}
					{#each $conversation.data.messages as message}
						{#if message.from == 'bot'}
							<div class="flex flex-col gap-1 m-2">
								<time class="text-xs opacity-60">{message.created}</time>
								<Icon class="text-slate-400" height="16" icon="ic:baseline-check" />
								<div class="flex">
									<div class="flex flex-col w-10">
										<Icon class="mt-auto" icon="line-md:reddit-loop" height="48" />
									</div>
									<div class="w-4 bg-surface-500">
										<div class="h-full rounded-br-full bg-surface-200 dark:bg-surface-800" />
									</div>
									<div class="bg-surface-500 flex-auto rounded-xl rounded-bl-none p-2">
										{#if message.text}
											{message.text}
										{/if}
									</div>
								</div>
							</div>
							{#if message.image}
								<img alt={message.text || 'image'} src={message.image} />
							{/if}
							{#if message.buttons}
								<nav class="m-2 w-full grid grid-cols-2 grid-flow-dense">
									{#each message.buttons as button}
										<button
											class="btn btn-sm btn-filled-primary text-sm m-1"
											on:click={() => {
												text = button.payload.replace('/', '');
												send(button.payload.replace('/', ''));
											}}>{button.title}</button
										>
									{/each}
								</nav>
							{/if}
							<div class="chat-footer opacity-50">{message.ready}</div>
						{:else}
							<div class="flex">
								<time class="flex-1 text-xs opacity-80">{message.created}</time>
								<Icon class="text-slate-400" height="16" icon="ic:baseline-check" />
							</div>
							<div class="flex">
								<!-- Chat message bubble-->
								<div class="bg-surface-400 flex-1 rounded-xl rounded-br-none p-2">
									{#if message.text}
										<div>{message.text}</div>
									{/if}
								</div>
								<div class="w-4 bg-surface-400">
									<div class="h-full rounded-bl-full bg-surface-200 dark:bg-surface-800" />
								</div>
								<div class="avatar flex flex-col w-10">
									{#if $page.data.session}
										<img
											src={$page.data.session?.user?.image}
											alt={$page.data.session?.user?.name}
											class="mt-auto w-6 h-6 rounded-full order-2"
										/>
									{/if}
								</div>
							</div>
							{#if message.image}
								<img alt={message.text || 'image'} src={message.image} />
							{/if}
						{/if}
					{/each}
				{/if}
			</div>
		</div>
		<div class="flex-none pt-4 mb-2 sm:mb-0">
			<div class="relative flex-none">
				<div class="absolute inset-y-0 flex items-center">
					<button type="button" class="btn btn-sm">
						<Icon icon="ic:baseline-mic" />
					</button>
				</div>
				<input
					type="text"
					bind:this={text_input}
					bind:value={text}
					on:keyup={enter}
					placeholder="Write your message!"
					class="w-full focus:outline-none focus:placeholder-gray-400 placeholder-gray-500 pl-10 rounded-md"
				/>
				<div class="absolute right-0 items-center inset-y-0 flex">
					<button class="btn btn-sm">
						<Icon icon="ic:baseline-attachment" />
					</button>
					<button class="btn btn-sm">
						<Icon icon="ic:baseline-camera-alt" />
					</button>
					<button
						on:click={() => {
							conversation.send(text);
						}}
						disabled={!text}
						class="btn btn-sm"
					>
						<Icon icon="ic:baseline-send" />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
