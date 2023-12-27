<script>
    import Dashboard from "../../../component/Dashboard.svelte";
    import "../../../app.css";
    import { auth } from "$lib/firebase/firebase";

    let user = auth.currentUser;
</script>

<div class="bg-gradient-to-br from-midnight-blue to-midnight-purple h-screen">
    <Dashboard/>
    <h1 class="flex justify-center text-ghost font-bold text-3xl">Welcome {user?.displayName}</h1>
</div>