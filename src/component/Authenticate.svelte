<div class="authContainer h-screen flex items-center justify-center">
    <!-- Main Login Container -->
    <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 flex flex-col gap-y-3 max-w-md w-full">
      <h1 class="text-3xl font-bold text-gray-800 mb-4 text-center">Login</h1>
      <div class="flex flex-col">
        <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
          <span class="w-3/12">Email</span>
          <input
            class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2"
            id="email" type="email" placeholder="Enter your email">
        </label>
      </div>
      <div class="flex flex-col">
        <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
          <span class="w-3/12">Password</span>
          <input
            class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2"
            id="password" type="password" placeholder="Enter your password">
        </label>
      </div>
      <!-- Buttons -->
  
      <div class="flex items-center justify-center">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit">
          Sign In
        </button>
      </div>
    </form>
</div>
  