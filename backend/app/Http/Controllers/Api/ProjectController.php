<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::all();
        return response()->json([
            'success' => true,
            'message' => 'Projects retrieved successfully',
            'data' => ProjectResource::collection($projects)
        ]);
    }

    public function store(StoreProjectRequest $request)
    {
        $validated = $request->validated();
        // Fallback created_by for demo purposes if not logged in
        $validated['created_by'] = Auth::id() ?? 1; 

        $project = Project::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully',
            'data' => new ProjectResource($project)
        ], 201);
    }

    public function show(Project $project)
    {
        return response()->json([
            'success' => true,
            'message' => 'Project retrieved successfully',
            'data' => new ProjectResource($project)
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully',
            'data' => new ProjectResource($project)
        ]);
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully',
            'data' => null
        ]);
    }
}
