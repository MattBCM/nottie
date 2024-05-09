const SideData = ({ data }) => {
  return (
    <div className="test">
      {data &&
        data.map((entry) => {
          return (
            <>
              <button className="accordion relative sectionDelete">
                {entry.title}
                <button
                  className="absolute top-y-2/4 right-2 hover:cursor-pointer"
                  onClick={(e) => {
                    let btn = e.currentTarget.parentElement;
                    let panel = btn.nextElementSibling;
                    panel.remove();
                    btn.remove();
                  }}
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </button>
              <div className="panel">
                <textarea placeholder="Write something here...">
                  {entry.text}
                </textarea>
                {entry.sub.length >= 1 && <SideData data={entry.sub} />}
                {entry.sub.length < 1 && <div className="test"></div>}
                <div className="flex justify-evenly items-center">
                  <input
                    type="text"
                    placeholder="Write title of sub section..."
                    className="mb-1"
                  ></input>
                  <button className="newSectBtn">
                    <i className="fa-solid fa-circle-plus" />
                  </button>
                </div>
              </div>
            </>
          );
        })}
    </div>
  );
};

export default SideData;
