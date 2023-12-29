<script>
    import Dashboard from "../../../component/Dashboard.svelte";
    import "../../../app.css";
    import { writable } from "svelte/store";
    import { auth } from "$lib/firebase/firebase";
    import { onMount } from "svelte";

    /**
     * @type {import("@firebase/auth").User | null}
     */
    let user;

    onMount(async () => {
        while (!auth.currentUser) {
            await new Promise(resolve => setTimeout(resolve, 100)); // wait for 100ms
        }
        user = auth.currentUser;
    });

</script>

{#if user}
    <div class="bg-gradient-to-br from-midnight-blue to-midnight-purple h-screen">
        <Dashboard/>
        <h1 class="flex justify-center text-ghost font-bold text-3xl">Welcome {user?.displayName}</h1>
    </div>
{/if}