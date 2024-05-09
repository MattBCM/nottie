const SideForm = () => {
  return (
    <form
      action=""
      onSubmit={(e) => {
        e.preventDefault();
        let html = `
              <button class="accordion">
              ${e.target.sectionname.value}
              <button class="absolute top-5 right-5">X</button></button>
              <div class="panel">
                <textarea id="" >Another Text Here</textarea>
              </div>`;
        e.target.insertAdjacentHTML("beforebegin", html);
        e.target.previousElementSibling.previousElementSibling.addEventListener(
          "click",
          function () {
            this.classList.toggle("active");
            var parent = this.parentElement;
            var panel = this.nextElementSibling;
            console.log(panel);
            if (panel.style.maxHeight) {
              panel.style.maxHeight = null;
            } else {
              panel.style.maxHeight = panel.scrollHeight + "px";
              parent.style.maxHeight =
                parseInt(parent.style.maxHeight) + panel.scrollHeight + "px";
            }
          }
        );
      }}
    ></form>
  );
};

export default SideForm;
