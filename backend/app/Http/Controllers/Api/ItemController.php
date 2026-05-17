<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Http\Resources\ItemResource;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::all();
        return response()->json([
            'success' => true,
            'message' => 'Items retrieved successfully',
            'data' => ItemResource::collection($items)
        ]);
    }

    public function store(StoreItemRequest $request)
    {
        $item = Item::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully',
            'data' => new ItemResource($item)
        ], 201);
    }

    public function show(Item $item)
    {
        return response()->json([
            'success' => true,
            'message' => 'Item retrieved successfully',
            'data' => new ItemResource($item)
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item)
    {
        $item->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => new ItemResource($item)
        ]);
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully',
            'data' => null
        ]);
    }
}
