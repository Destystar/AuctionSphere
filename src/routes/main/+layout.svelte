<script>
    import { authHandlers } from "../../store/store";
    import "../../app.css";
    import mainIcon from "../../resources/icons/appicon.png";

    let logoutHover = false;
    let isDashboardDropdownVisible = false;
    let isProfileDropdownVisible = false;

    function handleMouseOver() {
        logoutHover = true;
    }

    function handleMouseOut() {
        logoutHover = false;
    }

    function toggleDashboardDropdown() {
        isDashboardDropdownVisible = !isDashboardDropdownVisible;
    }

    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function showDashboardDropdown(event) {
        isDashboardDropdownVisible = true;
        event.stopPropagation(); // Prevent parent elements from handling the event
    }

    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function hideDashboardDropdown(event) {
        isDashboardDropdownVisible = false;
        event.stopPropagation(); // Prevent parent elements from handling the event
    }

    function toggleProfileDropdown() {
        isProfileDropdownVisible = !isProfileDropdownVisible;
    }

    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function showProfileDropdown(event) {
        isProfileDropdownVisible = true;
        event.stopPropagation(); // Prevent parent elements from handling the event
    }

    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function hideProfileDropdown(event) {
        isProfileDropdownVisible = false;
        event.stopPropagation(); // Prevent parent elements from handling the event
    }
</script>

<!-- Rest of the code remains unchanged -->


<!-- Rest of the code remains unchanged -->


<div class="bg-gradient-to-br from-midnight-blue to-midnight-purple h-screen">
    <nav class="bg-gradient-to-r from-slate-600 to-slate-700 text-gray-300 text-lg font-bold h-12 shadow-lg">
        <div class="container mx-auto flex items-center justify-between h-full px-4">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            <div class="relative" on:mouseover={showDashboardDropdown} on:mouseout={hideDashboardDropdown}>
                <a href="../main/dashboard" class="flex items-center text-xl">
                    <img class="h-8 mr-2" src={mainIcon} alt="Go to the HomePage">
                    <span class="text-slate-200">Dashboard</span>
                </a>
            </div>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="flex items-center space-x-3">
                <a href="../main/search" class="text-slate-300 hover:text-ghost transition text-md">Search</a>
                <a href="../main/discover" class="text-slate-300 hover:text-white transition text-md">Discover</a>
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                <div class="relative" on:mouseover={showProfileDropdown} on:mouseout={hideProfileDropdown}>
                    <button class="text-slate-200 hover:text-white focus:outline-none transition text-2xl">
                        <i class="fas fa-user-circle"></i>
                    </button>
                    <!-- Profile dropdown -->
                    {#if isProfileDropdownVisible}
                        <div id="profileDropdown" class="absolute top-full right-0 mt-2 bg-white shadow-lg rounded overflow-hidden z-10" on:mouseover={showProfileDropdown} on:mouseout={hideProfileDropdown}>
                            <!-- Dropdown options go here -->
                            <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Profile Option 1</a>
                            <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Profile Option 2</a>
                            <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Profile Option 3</a>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </nav>

    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <button on:click={authHandlers.logout} class="absolute top-16 right-8 p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded focus:outline-none focus:shadow-outline transition" type="submit" on:mouseout={handleMouseOut} on:mouseover={handleMouseOver}>
        {#if logoutHover}
            <i class="mr-1.5 fa-solid fa-arrow-right-from-bracket fa-beat-fade"></i>
        {:else}
            <i class="mr-1.5 fa-solid fa-arrow-right-from-bracket"></i>
        {/if}
        Logout
    </button>
    <slot></slot>
</div>