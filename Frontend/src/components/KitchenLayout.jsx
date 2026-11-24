import { Outlet } from "react-router-dom";
import KitchenSidebar from "./KitchenSidebar";
import NewOrderBell from "./NewOrderBell";

function KitchenLayout() {
    return (
        <div className="kitchen-app">

            <KitchenSidebar />

            <main className="kitchen-main">

                <header className="kitchen-topbar">

                    <NewOrderBell />

                </header>

                <section className="kitchen-content">
                    <Outlet />
                </section>

            </main>

        </div>
    );
}

export default KitchenLayout;
