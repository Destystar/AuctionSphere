<script>
    import { authHandlers } from "../../store/store";
    import "../../app.css";
    import mainIcon from "../../resources/icons/appicon.png";
    import { onMount, onDestroy } from 'svelte';
    import { auth } from "$lib/firebase/firebase";

    let logoutHover = false;
    let isDashboardDropdownVisible = false;
    let isProfileDropdownVisible = false;
    let user = auth.currentUser;

    onMount(() => {
        // @ts-ignore
        function handleClickOutside(event) {
            const dropdownElement = document.getElementById('profileDropdown');
            // @ts-ignore
            if (dropdownElement !== event.target && !dropdownElement.contains(event.target)) {
                isProfileDropdownVisible = false;
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });

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

<div class="bg-gradient-to-br from-midnight-blue to-midnight-purple h-screen">
    <nav class="bg-gradient-to-r from-slate-600 to-slate-700 text-gray-300 text-lg font-bold h-12 shadow-lg">
        <div class="container mx-auto flex items-center justify-between h-full px-4">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            <div>
                <a href="/main/dashboard" class="flex items-center text-xl">
                    <img class="h-8 mr-2" src={mainIcon} alt="Go to the HomePage">
                    <span class="text-slate-200">Dashboard</span>
                </a>
            </div>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="flex items-center space-x-3">
                <a href="/main/search" class="text-slate-300 hover:text-ghost transition text-md">Search</a>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="relative" on:click={showProfileDropdown}>
                    <button class="text-slate-200 hover:text-white focus:outline-none transition text-2xl">
                        <i class="fas fa-user-circle"></i>
                    </button>
                    <!-- Profile dropdown -->
                    {#if isProfileDropdownVisible}
                        <div id="profileDropdown" class="absolute top-full right-0 mt-2 bg-white shadow-lg rounded overflow-hidden z-10">
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <a class="block px-4 py-2 text-gray-800 hover:bg-gray-200 whitespace-nowrap" on:click={authHandlers.logout}>Log out</a>
                        </div>
                    {/if}
                </div> 
            </div>
        </div>
    </nav>
    <slot></slot>
</div>