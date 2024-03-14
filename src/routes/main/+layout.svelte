<script>
// @ts-nocheck

    import { authHandlers } from "../../store/store";
    import "../../app.css";
    import mainIcon from "../../resources/icons/appicon.png";
    import { onMount } from 'svelte';
    import { doc, getDoc } from "firebase/firestore";
    import { auth, db } from "$lib/firebase/firebase";

    let isProfileDropdownVisible = false;
    let user;
    let GBP = 0;
    let EUR = 0;
    let USD = 0;
    let JPY = 0;

    async function getUserGBP(userID) {
        const userRef = doc(db, 'user', userID);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            let GBP = userData.GBP;
            return GBP;
        }
    }

    async function getUserEUR(userID) {
        const userRef = doc(db, 'user', userID);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            let EUR = userData.EUR;
            return EUR;
        }
    }

    async function getUserUSD(userID) {
        const userRef = doc(db, 'user', userID);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            let USD = userData.USD;
            return USD;
        }
    }

    async function getUserJPY(userID) {
        const userRef = doc(db, 'user', userID);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            let JPY = userData.JPY;
            return JPY;
        }
    }

    async function fetchUserCurrencies() {
        GBP = await getUserGBP(user.uid);
        EUR = await getUserEUR(user.uid);
        USD = await getUserUSD(user.uid);
        JPY = await getUserJPY(user.uid);
    }

    onMount(async () => {
        while (!auth.currentUser) {
            await new Promise(resolve => setTimeout(resolve, 100)); // wait for 100ms
        }
        user = auth.currentUser;
        
        function handleClickOutside(event) {
            const dropdownElement = document.getElementById('profileDropdown');
            if (dropdownElement !== event.target && !dropdownElement.contains(event.target)) {
                isProfileDropdownVisible = false;
            }
        }

        await fetchUserCurrencies();

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });

    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function showProfileDropdown(event) {
        isProfileDropdownVisible = true;
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
                            <a class="block px-4 py-2 text-gray-800 hover:bg-gray-200 whitespace-nowrap" on:click={authHandlers.logout}>Log out</a>
                            <a class="block px-4 py-2 text-gray-800 hover:bg-gray-200 whitespace-nowrap">£{GBP}</a>
                            <a class="block px-4 py-2 text-gray-800 hover:bg-gray-200 whitespace-nowrap">€{EUR}</a>
                            <a class="block px-4 py-2 text-gray-800 hover:bg-gray-200 whitespace-nowrap">${USD}</a>
                            <a class="block px-4 py-2 text-gray-800 hover:bg-gray-200 whitespace-nowrap">¥{JPY}</a>
                        </div>
                    {/if}
                </div> 
            </div>
        </div>
    </nav>
    <slot></slot>
</div>