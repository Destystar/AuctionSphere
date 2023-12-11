<script>
    import "../app.css";
    import mainIcon from "../resources/icons/appicon.png";
</script>

<div>
    <nav class="bg-indigo-900 text-gray-300 text-lg font-bold h-9">
        <ul class="flex h-full list-none w-full justify-evenly items-center">
            <li>
                <a href="/" class="block text-center">Home</a>
            </li>
            <li>
                <a href="/dashboard" class="block text-center">Dashboard</a>
            </li>
            <li>
                <a href="/search" class="block text-center">Search</a>
            </li>
            <li>
                <a href="/discover" class="block text-center">Search</a>
            </li>
        </ul>
    </nav>
    <slot></slot>
</div>
