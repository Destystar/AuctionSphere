<script>
    import { authHandlers } from "../../store/store";
    import "../../app.css";
    import mainIcon from "../../resources/icons/appicon.png";

    let logoutHover = false;

    function handleMouseOver() {
        logoutHover = true;
    }

    function handleMouseOut(){
        logoutHover = false;
    }

</script>

<div class="bg-gradient-to-br from-midnight-blue to-midnight-purple h-screen">
    <nav class="bg-dim-grey text-gray-300 text-lg font-bold h-9">
        <ul class="flex h-full list-none w-full justify-between items-center px-4">
            <h1>
                <a href="../main/dashboard"><img class="h-9 " src={mainIcon} alt="Go to the HomePage"></a>
            </h1>
            <li>
                <a href="../main/dashboard" class="block text-center text-black">Dashboard</a>
            </li>
            <li>
                <a href="../main/search" class="block text-center text-black">Search</a>
            </li>
            <li>
                <a href="../main/discover" class="block text-center text-black">Discover</a>
            </li>
            <li></li>
        </ul>
    </nav>
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <button on:click={authHandlers.logout} class="absolute top-11 right-3 p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded focus:outline-none focus:shadow-outline" type="submit" on:mouseout={handleMouseOut} on:mouseover={handleMouseOver}>{#if logoutHover}<i class="mr-1.5 fa-solid fa-arrow-right-from-bracket fa-beat-fade"></i>{:else}<i class="mr-1.5 fa-solid fa-arrow-right-from-bracket"></i>{/if}Logout</button>
    <slot></slot>
</div>
