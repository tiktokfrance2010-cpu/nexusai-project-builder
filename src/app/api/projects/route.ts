import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

const VALID_PROJECT_TYPES = ['website', 'app', 'presentation', 'auto'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(projects).orderBy(desc(projects.createdAt));

    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json(
          { 
            error: 'Invalid user_id parameter',
            code: 'INVALID_USER_ID' 
          },
          { status: 400 }
        );
      }
      query = query.where(eq(projects.userId, userIdInt));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, description, projectType, imageUrl } = body;

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (typeof userId !== 'number' || isNaN(userId)) {
      return NextResponse.json(
        { 
          error: 'userId must be a valid integer',
          code: 'INVALID_USER_ID_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate description
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        { 
          error: 'description is required and cannot be empty',
          code: 'MISSING_DESCRIPTION' 
        },
        { status: 400 }
      );
    }

    // Validate projectType
    if (!projectType || typeof projectType !== 'string' || projectType.trim() === '') {
      return NextResponse.json(
        { 
          error: 'projectType is required and cannot be empty',
          code: 'MISSING_PROJECT_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!VALID_PROJECT_TYPES.includes(projectType as any)) {
      return NextResponse.json(
        { 
          error: `projectType must be one of: ${VALID_PROJECT_TYPES.join(', ')}`,
          code: 'INVALID_PROJECT_TYPE' 
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      userId,
      description: description.trim(),
      projectType,
      createdAt: new Date().toISOString(),
    };

    if (imageUrl !== undefined && imageUrl !== null) {
      insertData.imageUrl = imageUrl;
    }

    // Insert new project
    const newProject = await db.insert(projects)
      .values(insertData)
      .returning();

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}