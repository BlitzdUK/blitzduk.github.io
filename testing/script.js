// https://www.creativecodingclub.com/courses/take/gsap-3-express/lessons/31379257-rollover-hover-effects-for-multiple-elements

// const item = document.querySelector(".item");

gsap.defaults({ duration: 0.5 });

const items = document.querySelectorAll(".item"); // returns a NodeList

items.forEach(function (item, index) {
	// console.log(item, index)
	const tl = gsap
		.timeline({ paused: true })
		.to(item.querySelector(".text"), {
			color: "#fff",
			x: 10,
			scale: 1.3,
			textShadow: "0 2px 0 hsla(0, 0%, 0%, 1), 0 4px 0 hsla(24, 100%, 50%, 1)",
			transformOrigin: "left center"
		})
		.to(
			item.querySelector(".dot"),
			{ backgroundColor: "hsla(24, 100%, 50%, 1)", scale: 1.5 },
			0
		);

	item.addEventListener("mouseenter", () => tl.play());
	item.addEventListener("mouseleave", () => tl.reverse());
});