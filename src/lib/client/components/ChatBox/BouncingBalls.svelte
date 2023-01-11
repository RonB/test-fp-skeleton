<div class="w-8 h-10 flex justify-between">
	<div class="ball" />
	<div class="ball ball2" />
	<div class="ball ball3" />
</div>

<style>
	.ball {
		width: 10px;
		height: 10px;
		background: #333;
		border-radius: 50%;
		animation: bounce 1.2s infinite ease-in-out;
	}

	.ball2 {
		animation-delay: 0.2s;
	}
	.ball3 {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(0, -10px);
			background: #ccc;
		}
		/*     50% {transform: translate(0,-10px);background:#72c2c2;} */
		40% {
			transform: translate(0, 3px);
		}
		50% {
			transform: translate(0, 0px);
		}
	}
</style>
