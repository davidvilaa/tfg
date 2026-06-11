import { NextResponse } from 'next/server';

const PLATAFORMAS_MAP: Record<number, string> = {
  37: "3ds", 33: "gameboy", 24: "gameboyadvance", 22: "gameboycolor",
  21: "gamecube", 4: "n64", 20: "nds", 18: "nes", 6: "pc", 7: "ps1",
  8: "ps2", 9: "ps3", 48: "ps4", 167: "ps5", 38: "psp", 46: "psvita",
  19: "snes", 130: "switch", 508: "switch2", 5: "wii", 41: "wiiu",
  11: "xbox", 12: "xbox360", 49: "xboxone", 169: "xboxseriesxs"
};

const CONSOLAS_YEARS: Record<number, number> = {
  18: 1983, 33: 1989, 19: 1990, 22: 1998,7:  1994, 4:  1996, 24: 2001, 8:  2000, 21: 2001, 11: 2001, 20: 2004, 
  38: 2004, 12: 2005,9:  2006, 5:  2006, 37: 2011, 46: 2011,41: 2012, 48: 2013, 49: 2013,130: 2017,167: 2020, 
  169: 2020, 508: 2025, 6:  2000
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID del juego' }, { status: 400 });
  }

  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Faltan las credenciales de Twitch en el .env");
      return NextResponse.json({ error: 'Faltan credenciales del servidor' }, { status: 500 });
    }

    const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
      method: 'POST',
      cache: 'no-store'
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("Twitch no nos dio el token:", tokenData);
      return NextResponse.json({ error: 'Error de autenticación con Twitch' }, { status: 500 });
    }

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: `fields name, summary, cover.image_id, artworks.image_id, screenshots.image_id, platforms, first_release_date; where id = ${id};`,
      cache: 'no-store'
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Juego no encontrado en IGDB' }, { status: 404 });
    }

    const game = data[0];

    const coverUrl = game.cover?.image_id 
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` 
      : null;
    
    let bannerUrl = null;
    if (game.screenshots && game.screenshots.length > 0) {
      const randomIndex = Math.floor(Math.random() * game.screenshots.length);
      bannerUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${game.screenshots[randomIndex].image_id}.jpg`;
    } else if (game.artworks && game.artworks.length > 0) {
      const randomIndex = Math.floor(Math.random() * game.artworks.length);
      bannerUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${game.artworks[randomIndex].image_id}.jpg`;
    }

    let anioJuego = 2000;
    if (game.first_release_date) {
      anioJuego = new Date(game.first_release_date * 1000).getFullYear();
    }

    let consolasOrdenadas: string[] = [];
    if (game.platforms && game.platforms.length > 0) {
      const plataformasIDs = game.platforms.filter((pid: number) => PLATAFORMAS_MAP[pid]);
      
      plataformasIDs.sort((a: number, b: number) => {
        const distA = Math.abs(anioJuego - (CONSOLAS_YEARS[a] || 2000));
        const distB = Math.abs(anioJuego - (CONSOLAS_YEARS[b] || 2000));
        return distA - distB;
      });

      consolasOrdenadas = [...new Set(plataformasIDs.map((pid: number) => PLATAFORMAS_MAP[pid]))] as string[];
    }

    return NextResponse.json({
      id: game.id,
      title: game.name,
      summary: game.summary || 'Aún no hay una descripción disponible para este juegazo.',
      cover_image_url: coverUrl,
      banner_url: bannerUrl,
      platforms: consolasOrdenadas
    });

  } catch (error) {
    console.error("Error catastrófico en la API:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}