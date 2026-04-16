import { Markup } from 'telegraf';
import { STATES, setState, clearSession, getState, getData } from './state.js';
import {
  insertMovie, insertMovieFile,
  insertEpisode, insertEpisodeFile, getMovieById
} from '../db/queries.js';

const GENRES = ['Action','Adventure','Animation','Comedy','Crime','Documentary','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','Western'];

function genreKeyboard() {
  const rows = [];
  for (let i = 0; i < GENRES.length; i += 3) {
    rows.push(GENRES.slice(i, i + 3).map(g => Markup.button.callback(g, `genre_${g}`)));
  }
  return Markup.inlineKeyboard(rows);
}

function typeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🎬 Single Movie', 'type_movie')],
    [Markup.button.callback('📺 Series', 'type_series')],
  ]);
}

function yesNoKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Yes, add another', 'more_yes')],
    [Markup.button.callback('❌ No, finish', 'more_no')],
  ]);
}

function seriesMoreKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add episode to this season', 'series_more_ep')],
    [Markup.button.callback('📁 New season', 'series_more_season')],
    [Markup.button.callback('✅ Done with series', 'series_done')],
  ]);
}

export function registerCommands(bot, adminId) {
  function isAdmin(ctx) {
    return String(ctx.from?.id) === String(adminId);
  }

  bot.command('start', (ctx) => {
    const webAppUrl = process.env.WEBAPP_URL;
    const keyboard = webAppUrl
      ? Markup.inlineKeyboard([[Markup.button.webApp('🎬 Open DY SHOWS', webAppUrl)]])
      : Markup.inlineKeyboard([]);
    ctx.reply(
      `🎥 *Welcome to DY SHOWS*\n\nYour premium movie & series streaming bot.${webAppUrl ? '\n\nTap the button below to open the app:' : ''}`,
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });

  bot.command('upload', async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply('⛔ Unauthorized.');
    clearSession(ctx.from.id);
    setState(ctx.from.id, STATES.SELECT_TYPE);
    await ctx.reply('📤 *New Upload*\n\nWhat type of content are you uploading?', {
      parse_mode: 'Markdown',
      ...typeKeyboard()
    });
  });

  bot.command('cancel', (ctx) => {
    if (!isAdmin(ctx)) return;
    clearSession(ctx.from.id);
    ctx.reply('✖️ Upload cancelled.');
  });

  bot.command('requests', async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply('⛔ Unauthorized.');
    const { getPendingRequests } = await import('../db/queries.js');
    const { requests } = await getPendingRequests();
    if (!requests.length) return ctx.reply('No pending requests.');
    const text = requests.slice(0, 10).map((r, i) =>
      `${i+1}. *${r.movie_title}*${r.genre ? ` (${r.genre})` : ''}\n   by: ${r.full_name || r.username || r.telegram_user_id}${r.notes ? `\n   note: ${r.notes}` : ''}`
    ).join('\n\n');
    ctx.reply(`📋 *Pending Requests:*\n\n${text}`, { parse_mode: 'Markdown' });
  });

  bot.action('type_movie', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    setState(ctx.from.id, STATES.ENTER_TITLE, { type: 'movie' });
    await ctx.editMessageText('🎬 *Single Movie*\n\nStep 1/6 — Enter the *title*:', { parse_mode: 'Markdown' });
  });

  bot.action('type_series', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    setState(ctx.from.id, STATES.ENTER_TITLE, { type: 'series' });
    await ctx.editMessageText('📺 *Series*\n\nStep 1/6 — Enter the *title*:', { parse_mode: 'Markdown' });
  });

  GENRES.forEach(genre => {
    bot.action(`genre_${genre}`, async (ctx) => {
      if (!isAdmin(ctx)) return;
      await ctx.answerCbQuery();
      setState(ctx.from.id, STATES.ENTER_YEAR, { genre });
      await ctx.editMessageText(`✅ Genre: *${genre}*\n\nStep 3/6 — Enter *release year* (or type "skip"):`, { parse_mode: 'Markdown' });
    });
  });

  bot.action('more_yes', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const data = getData(ctx.from.id);
    const qualityCount = (data.files ?? []).length + 1;
    setState(ctx.from.id, STATES.ENTER_QUALITY_LABEL);
    const labels = ['1080p','720p','480p','4K','Web-DL','WEB-DL'];
    const suggestion = labels[qualityCount - 1] ? ` (e.g. ${labels[qualityCount - 1]})` : '';
    await ctx.editMessageText(`➕ *Add Another Quality*\n\nEnter quality label${suggestion}:`, { parse_mode: 'Markdown' });
  });

  bot.action('more_no', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const data = getData(ctx.from.id);
    clearSession(ctx.from.id);
    await ctx.editMessageText(
      `✅ *Upload Complete!*\n\n🎬 *${data.title}*\n📁 ${(data.files ?? []).length} file(s) added.\n\nThe title is now live in DY SHOWS.`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.action('series_more_ep', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const data = getData(ctx.from.id);
    setState(ctx.from.id, STATES.SERIES_ENTER_EPISODE_NUM);
    await ctx.editMessageText(
      `📝 *Season ${data.currentSeason}*\n\nEnter the *episode number*:`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.action('series_more_season', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    setState(ctx.from.id, STATES.SERIES_ENTER_SEASON);
    await ctx.editMessageText('📁 Enter the new *season number*:', { parse_mode: 'Markdown' });
  });

  bot.action('series_done', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const data = getData(ctx.from.id);
    clearSession(ctx.from.id);
    await ctx.editMessageText(
      `✅ *Series Upload Complete!*\n\n📺 *${data.title}*\nAll episodes have been saved.`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.action('series_ep_more_yes', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    setState(ctx.from.id, STATES.SERIES_ENTER_EPISODE_QUALITY);
    await ctx.editMessageText('Enter quality label for next file (e.g. 720p):', { parse_mode: 'Markdown' });
  });

  bot.action('series_ep_more_no', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const data = getData(ctx.from.id);
    setState(ctx.from.id, STATES.SERIES_ASK_MORE_EPISODE);
    await ctx.editMessageText(
      `✅ Episode ${data.currentEpisode} saved!\n\nWhat would you like to do next?`,
      { parse_mode: 'Markdown', ...seriesMoreKeyboard() }
    );
  });

  bot.on('message', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const state = getState(ctx.from.id);
    if (state === STATES.IDLE) return;

    const text = ctx.message.text?.trim();
    const fileId = ctx.message.document?.file_id ||
                   ctx.message.video?.file_id ||
                   ctx.message.audio?.file_id ||
                   text;

    const data = getData(ctx.from.id);

    if (state === STATES.ENTER_TITLE) {
      if (!text) return ctx.reply('Please send a text title.');
      setState(ctx.from.id, STATES.ENTER_GENRE, { title: text });
      await ctx.reply(`✅ Title: *${text}*\n\nStep 2/6 — Select *genre*:`, {
        parse_mode: 'Markdown',
        ...genreKeyboard()
      });
      return;
    }

    if (state === STATES.ENTER_YEAR) {
      const year = text === 'skip' || text === '-' ? null : parseInt(text, 10);
      setState(ctx.from.id, STATES.ENTER_POSTER, { release_year: isNaN(year) ? null : year });
      await ctx.reply(`Step 4/6 — Send the *poster image URL* (.jpg link or Telegra.ph link):`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.ENTER_POSTER) {
      if (!text || !text.startsWith('http')) return ctx.reply('Please send a valid URL starting with http.');
      setState(ctx.from.id, STATES.ENTER_TRAILER, { poster_url: text });
      await ctx.reply(`Step 5/6 — Send the *YouTube trailer link* (or type "skip"):`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.ENTER_TRAILER) {
      const trailerUrl = (text === 'skip' || text === '-') ? null : text;
      setState(ctx.from.id, STATES.ENTER_ABOUT, { trailer_url: trailerUrl });
      await ctx.reply(`Step 6/6 — Write the *about/description* text for this title:\n\n_(Send a short summary or type "skip")_`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.ENTER_ABOUT) {
      const about = (text === 'skip' || text === '-') ? '' : (text ?? '');
      const newData = { ...data, about };

      const { movie, error } = await insertMovie({
        title: newData.title,
        poster_url: newData.poster_url || '',
        trailer_url: newData.trailer_url || null,
        about,
        type: newData.type,
        genre: newData.genre || 'Action',
        release_year: newData.release_year || null,
      });

      if (error || !movie) {
        await ctx.reply(`❌ Failed to save: ${error?.message || 'Unknown error'}`);
        clearSession(ctx.from.id);
        return;
      }

      setState(ctx.from.id, STATES.ENTER_QUALITY_LABEL, { movieId: movie.id, files: [] });

      if (newData.type === 'movie') {
        await ctx.reply(
          `✅ Movie created!\n\n🎬 *${newData.title}*\n\nNow let's add download files.\n\nEnter the *quality label* for the first file (e.g. 1080p, 720p, 4K):`,
          { parse_mode: 'Markdown' }
        );
      } else {
        setState(ctx.from.id, STATES.SERIES_ENTER_SEASON, { movieId: movie.id, files: [] });
        await ctx.reply(
          `✅ Series created!\n\n📺 *${newData.title}*\n\nNow add episodes.\n\nEnter the *season number* to start:`,
          { parse_mode: 'Markdown' }
        );
      }
      return;
    }

    if (state === STATES.ENTER_QUALITY_LABEL) {
      if (!text) return ctx.reply('Please send a quality label (e.g. 1080p, 720p, 4K).');
      setState(ctx.from.id, STATES.ENTER_FILE, { currentQuality: text });
      await ctx.reply(`📎 Quality: *${text}*\n\nNow send the *file* (or Telegram file_id) for this quality:`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.ENTER_FILE) {
      if (!fileId) return ctx.reply('Please send a file or file_id.');
      setState(ctx.from.id, STATES.ENTER_FILE_SIZE, { currentFileId: fileId });
      await ctx.reply(`📦 File received!\n\nEnter the *file size* for display (e.g. 2.5GB) — or type "skip":`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.ENTER_FILE_SIZE) {
      const fileSize = (text === 'skip' || text === '-') ? '' : (text ?? '');
      const { file, error } = await insertMovieFile({
        movie_id: data.movieId,
        quality: data.currentQuality,
        file_id: data.currentFileId,
        file_size: fileSize,
      });

      if (error || !file) {
        await ctx.reply(`❌ Failed to save file: ${error?.message}`);
        return;
      }

      const files = [...(data.files ?? []), file];
      setState(ctx.from.id, STATES.ASK_MORE_QUALITY, { files, currentQuality: undefined, currentFileId: undefined });
      await ctx.reply(
        `✅ *${data.currentQuality}* file saved!\n\nTotal files: ${files.length}\n\nDo you want to add another quality?`,
        { parse_mode: 'Markdown', ...yesNoKeyboard() }
      );
      return;
    }

    if (state === STATES.SERIES_ENTER_SEASON) {
      const season = parseInt(text, 10);
      if (isNaN(season) || season < 1) return ctx.reply('Please send a valid season number.');
      setState(ctx.from.id, STATES.SERIES_ENTER_EPISODE_NUM, { currentSeason: season });
      await ctx.reply(`📁 *Season ${season}*\n\nEnter the *episode number*:`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.SERIES_ENTER_EPISODE_NUM) {
      const epNum = parseInt(text, 10);
      if (isNaN(epNum) || epNum < 1) return ctx.reply('Please send a valid episode number.');
      setState(ctx.from.id, STATES.SERIES_ENTER_EPISODE_TITLE, { currentEpisode: epNum });
      await ctx.reply(`Episode *S${data.currentSeason}E${epNum}*\n\nEnter episode *title* (or type "skip"):`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.SERIES_ENTER_EPISODE_TITLE) {
      const epTitle = (text === 'skip' || text === '-') ? '' : (text ?? '');
      const { episode, error } = await insertEpisode({
        movie_id: data.movieId,
        season: data.currentSeason,
        episode_number: data.currentEpisode,
        title: epTitle,
      });

      if (error || !episode) {
        await ctx.reply(`❌ Failed to save episode: ${error?.message}`);
        return;
      }

      setState(ctx.from.id, STATES.SERIES_ENTER_EPISODE_QUALITY, { currentEpisodeId: episode.id });
      await ctx.reply(
        `✅ Episode created!\n\nEnter quality label for the file (e.g. 1080p, 720p):`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    if (state === STATES.SERIES_ENTER_EPISODE_QUALITY) {
      if (!text) return ctx.reply('Please send a quality label.');
      setState(ctx.from.id, STATES.SERIES_ENTER_EPISODE_FILE, { currentEpQuality: text });
      await ctx.reply(`📎 Quality: *${text}*\n\nSend the *file* for this episode:`, { parse_mode: 'Markdown' });
      return;
    }

    if (state === STATES.SERIES_ENTER_EPISODE_FILE) {
      if (!fileId) return ctx.reply('Please send a file or file_id.');
      await insertEpisodeFile({
        episode_id: data.currentEpisodeId,
        quality: data.currentEpQuality,
        file_id: fileId,
        file_size: '',
      });
      setState(ctx.from.id, STATES.SERIES_ASK_MORE_EPISODE, { currentEpQuality: undefined });
      await ctx.reply(
        `✅ File saved for this episode!\n\nDo you want to add another quality for this episode?`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('➕ More quality', 'series_ep_more_yes')],
            [Markup.button.callback('➡️ Continue', 'series_ep_more_no')],
          ])
        }
      );
      return;
    }
  });
}
