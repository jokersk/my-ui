@props([
    'label' => null,
    'required' => false
])
<div x-data="{ id: $id('input') }" {{ $attributes }}>
    <label :for="id">
        {{ $label }}
        <span class="text-red-500">
            {{ $required ? '*' : '' }}
        </span>
    </label>
    {{ $slot }}
</div>
