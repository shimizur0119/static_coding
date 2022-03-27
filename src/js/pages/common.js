import { gsap } from "gsap"



const commonInit = () => {
  console.log("common!");
  gsap.to("header", { scaleY: 1, delay: 1, duration: 2, color: "red" })
}

document.addEventListener("DOMContentLoaded", function () {
  commonInit()
});