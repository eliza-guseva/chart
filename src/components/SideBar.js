

const SideBar = ({sections}) => {
    return (
        <div className="flex flex-col">
            {sections.map((section, i) => (
                <div key={i} className="btnboring">
                    {section}
                </div>
            ))}
        </div>
    );
    }
export default SideBar;