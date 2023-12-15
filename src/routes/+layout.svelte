<script>
    import "../app.css";
    import mainIcon from "../resources/icons/appicon.png";
</script>

<div class="bg-gradient-to-br from-midnight-blue to-midnight-purple">
    <nav class="bg-dim-grey text-gray-300 text-lg font-bold h-9">
        <ul class="flex h-full list-none w-full justify-between items-center px-4">
            <h1>
                <a href="/"><img class="h-9 " src={mainIcon} alt="Go to the HomePage"></a>
            </h1>
            <li>
                <a href="/dashboard" class="block text-center text-black">Dashboard</a>
            </li>
            <li>
                <a href="/search" class="block text-center text-black">Search</a>
            </li>
            <li>
                <a href="/discover" class="block text-center text-black">Discover</a>
            </li>
            <li></li>
        </ul>
    </nav>
    <slot></slot>
</div>
