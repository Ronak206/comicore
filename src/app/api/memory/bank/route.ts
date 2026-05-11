import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Character from "@/lib/models/Character";
import World from "@/lib/models/World";
import { getSession } from "@/lib/auth";

/**
 * GET /api/memory/bank
 *
 * Fetches memory bank data for the CURRENT USER only:
 * - Overview: Books overview with stats
 * - Characters: Characters from user's books
 * - Visual Style: Art styles from user's books
 * - Panel Layouts: Page index and layout info
 * - World Info: World settings from user's books
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const userId = session.userId;

    // Build query - ALWAYS filter by user ID
    const bookQuery: any = { userId };
    if (bookId) {
      bookQuery._id = bookId;
    }

    // Fetch only user's books
    const books = await Book.find(bookQuery)
      .select("title genre synopsis tone status style chapters pageIndex userId")
      .sort({ updatedAt: -1 })
      .lean();

    // Get all book IDs for related queries
    const bookIds = books.map((b) => b._id);

    // Fetch characters
    const characters = await Character.find(
      bookId ? { bookId } : { bookId: { $in: bookIds } }
    )
      .select("bookId name role description appearance personality")
      .sort({ name: 1 })
      .lean();

    // Fetch world info
    const worlds = await World.find(
      bookId ? { bookId } : { bookId: { $in: bookIds } }
    )
      .select("bookId setting timePeriod atmosphere technology keyLocations rules")
      .lean();

    // Format overview data
    const overview = books.map((book) => ({
      id: book._id.toString(),
      title: book.title,
      genre: book.genre,
      synopsis: book.synopsis,
      tone: book.tone,
      status: book.status,
      chapterCount: book.chapters?.length || 0,
      pageCount: book.pageIndex?.length || 0,
    }));

    // Format characters with book title
    const formattedCharacters = characters.map((char) => {
      const book = books.find((b) => b._id.toString() === char.bookId.toString());
      return {
        id: char._id.toString(),
        bookId: char.bookId.toString(),
        bookTitle: book?.title || "Unknown",
        name: char.name,
        role: char.role,
        description: char.description,
        appearance: char.appearance,
        personality: char.personality,
      };
    });

    // Format visual styles
    const visualStyles = books.map((book) => ({
      id: book._id.toString(),
      bookTitle: book.title,
      artStyle: book.style?.artStyle || "default",
      colorPalette: book.style?.colorPalette || "dark",
      panelDensity: book.style?.panelDensity || "medium",
      speechBubbleStyle: book.style?.speechBubbleStyle || "standard",
      narrationStyle: book.style?.narrationStyle || "present",
      detailLevel: book.style?.detailLevel || "high",
      referenceNotes: book.style?.referenceNotes || "",
    }));

    // Format panel layouts
    const panelLayouts = books.flatMap((book) => {
      if (!book.pageIndex || book.pageIndex.length === 0) return [];

      return book.pageIndex.map((page: any, idx: number) => ({
        id: `${book._id}-${page.pageNumber}`,
        bookId: book._id.toString(),
        bookTitle: book.title,
        pageNumber: page.pageNumber,
        title: page.title,
        description: page.description,
        chapter: page.chapter,
        chapterNumber: page.chapterNumber,
        chapterTitle: page.chapterTitle,
        keyEvents: page.keyEvents || [],
      }));
    });

    // Format world info
    const worldInfo = worlds.map((world) => {
      const book = books.find((b) => b._id.toString() === world.bookId.toString());
      return {
        id: world._id.toString(),
        bookId: world.bookId.toString(),
        bookTitle: book?.title || "Unknown",
        setting: world.setting,
        timePeriod: world.timePeriod,
        atmosphere: world.atmosphere,
        technology: world.technology,
        keyLocations: world.keyLocations,
        rules: world.rules,
      };
    });

    // Calculate stats
    const stats = {
      totalBooks: books.length,
      totalCharacters: characters.length,
      totalWorlds: worlds.length,
      totalPages: books.reduce((acc, book) => acc + (book.pageIndex?.length || 0), 0),
      totalChapters: books.reduce((acc, book) => acc + (book.chapters?.length || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        overview,
        characters: formattedCharacters,
        visualStyles,
        panelLayouts,
        worldInfo,
      },
      stats,
    });
  } catch (error: any) {
    console.error("Memory bank fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch memory bank data." },
      { status: 500 }
    );
  }
}
